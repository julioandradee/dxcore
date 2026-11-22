using PKHeX.Core;
using PKHeX.Everywhere.Engine.Dtos;
using PKHeX.Facade;
using PKHeX.Facade.Extensions;
using Pokemon = PKHeX.Facade.Pokemons.Pokemon;
using Transfers = PKHeX.Facade.Transfers;

namespace PKHeX.Everywhere.Engine.Handlers;

public static class BoxHandlers
{
    [Query("box.get", Topics.Box)]
    public static PokemonSummary[] Get(Game game) => game.Trainer.PokemonBox.Boxed()
        .Select(boxed => boxed.Pokemon.ToSummary(PokemonSlots.BoxHandle(game.SaveFile, boxed.Index)))
        .ToArray();

    /// <summary>
    /// Lists every box in the save in order, empty ones included, with its name and slot count.
    /// </summary>
    [Query("box.list", Topics.Box)]
    public static BoxEntry[] List(Game game) => game.Trainer.PokemonBox.Boxes.Select(box => box.ToEntry()).ToArray();

    [Query("box.showdown", Topics.Box)]
    public static string Showdown(Game game) => game.Trainer.PokemonBox.Showdown();

    /// <summary>
    /// Shows how <c>box.addFromFile</c> would add a Pokémon file to the loaded save. Nothing is written.
    /// Fails with <c>unparseable</c> when the bytes aren't a Pokémon, <c>not-in-game</c> when the game doesn't have its species,
    /// and <c>conversion-failed</c> when PKHeX can't convert it at all.
    /// </summary>
    [Query("box.previewFile", Topics.Box, Topics.Trainer)]
    public static FilePreview PreviewFile(Game game, byte[] bytes)
    {
        var import = Import(game, bytes);
        return new FilePreview(
            import.Arrives.ToPreview(),
            import.Unofficial,
            import.Changes.Select(change => change.ToDto()).ToArray(),
            import.Legality() is { } legality ? new Legality(legality.Valid, legality.Messages.ToArray()) : null);
    }

    /// <summary>
    /// Adds a Pokémon file to the first empty box slot, converted to the loaded save's format.
    /// Fails with <c>unparseable</c>, <c>not-in-game</c> and <c>conversion-failed</c> as <c>box.previewFile</c> does, and with <c>box-full</c> when no slot is empty.
    /// A file no game can move into the save fails with <c>conversion-failed</c> unless <c>allowUnofficial</c> is set.
    /// </summary>
    [Command("box.addFromFile", Topics.Box)]
    public static AddedPokemon AddFromFile(Session session, Game game, byte[] bytes, AddFromFileOptions? options = null)
    {
        var import = Import(game, bytes);
        if (import.Unofficial && options?.AllowUnofficial != true)
            throw new EngineException(ErrorCodes.ConversionFailed, $"No game can move {import.Arrives.Species.Name} to {game.SaveVersion.Name}. Pass allowUnofficial to add it anyway.");

        return AddToBox(session, game, import.Arrives, PokemonAddSource.File);
    }

    [Command("box.addEncounter", Topics.Box)]
    public static AddedPokemon AddEncounter(Session session, Game game, int index)
    {
        game.Require(Capability.Encounters);
        if (session.Encounters is not { } encounters || index < 0 || index >= encounters.Count)
            throw new EngineException(ErrorCodes.NotFound, "That encounter isn't in the latest search. Search again.");

        return AddToBox(session, game, encounters[index].ConvertToPokemon(), PokemonAddSource.Encounter);
    }

    private static Transfers.PokemonImport Import(Game game, byte[] bytes)
    {
        Pokemon loaded;
        try
        {
            loaded = Pokemon.LoadFrom(bytes, game);
        }
        catch (InvalidOperationException e)
        {
            throw new EngineException(ErrorCodes.Unparseable, "The file isn't a Pokémon.", e);
        }

        return Converting(loaded, game, () => Transfers.Transfer.Import(loaded, game));
    }

    internal static Transfers.PokemonImport Converting(Pokemon loaded, Game to, Func<Transfers.PokemonImport> convert)
    {
        try
        {
            return convert();
        }
        catch (Transfers.PokemonRefusedException e) when (e.Reason == Transfers.TransferRefusal.SpeciesNotInGame)
        {
            throw new EngineException(ErrorCodes.NotInGame, $"{loaded.Species.Name} doesn't exist in {to.SaveVersion.Name}.", e);
        }
        catch (Transfers.PokemonRefusedException e)
        {
            throw new EngineException(ErrorCodes.ConversionFailed, $"Can't convert {loaded.Species.Name} to {to.SaveVersion.Name} ({e.Reason}).", e);
        }
    }

    private static AddedPokemon AddToBox(Session session, Game game, Pokemon pokemon, PokemonAddSource source)
    {
        var box = game.Trainer.PokemonBox;
        if (!box.AddOnEmptySlot(pokemon, out var index))
            throw new EngineException(ErrorCodes.BoxFull, "Your box is full.");

        var at = PokemonSlots.BoxHandle(game.SaveFile, index);
        session.Raise(new PokemonAdded(at, source, box.All[index].ToOverview()));
        return new AddedPokemon(new PokemonId(box.All[index].UniqueId.Value), at);
    }

    /// <summary>
    /// Moves one or more Pokémon to a target box, strictly validating box capacity and limits.
    /// Can move Pokémon from other boxes or from the party.
    /// </summary>
    [Requires(Requirement.Save)]
    [Command("box.moveToBox", Topics.Box)]
    public static void MoveToBox(Session session, Game game, PokemonHandle[] pokemons, int targetBox)
    {
        var save = game.SaveFile;
        if (targetBox < 0 || targetBox >= save.BoxCount)
            throw new EngineException(ErrorCodes.BadArguments, $"Caixa inválida: {targetBox + 1}. O save possui {save.BoxCount} caixas.");

        var slotCount = save.BoxSlotCount;
        var targetStart = targetBox * slotCount;

        var boxIndices = pokemons
            .Where(p => p.Source == SlotSource.Box && p.Box.HasValue && p.Box.Value != targetBox)
            .Select(p => p.Box!.Value * slotCount + p.Slot)
            .Where(idx => idx >= 0 && idx < game.Trainer.PokemonBox.All.Count && !game.Trainer.PokemonBox.All[idx].IsEmpty)
            .Distinct()
            .ToList();

        var partySlots = pokemons
            .Where(p => p.Source == SlotSource.Party)
            .Select(p => p.Slot)
            .Where(s => s >= 0 && s < game.Trainer.Party.Pokemons.Count && !game.Trainer.Party.Pokemons[s].IsEmpty)
            .Distinct()
            .ToList();

        var totalToMove = boxIndices.Count + partySlots.Count;
        if (totalToMove == 0) return;

        if (partySlots.Count > 0)
        {
            if (save is SAV7b)
                throw new EngineException(ErrorCodes.NotSupported, "Saves de Let's Go gerenciam a equipe diretamente pelo Box.");

            var currentPartyCount = game.Trainer.Party.Members().Count();
            if (currentPartyCount - partySlots.Count < 1)
                throw new EngineException(ErrorCodes.BadArguments, "A equipe não pode ficar vazia. Deve restar pelo menos 1 Pokémon na equipe.");
        }

        var targetEmptySlots = new List<int>();
        for (var s = 0; s < slotCount; s++)
        {
            var flat = targetStart + s;
            if (save.IsBoxSlotOverwriteProtected(flat)) continue;
            if (game.Trainer.PokemonBox.All[flat].IsEmpty)
                targetEmptySlots.Add(flat);
        }

        if (totalToMove > targetEmptySlots.Count)
            throw new EngineException(ErrorCodes.BoxFull, $"A Caixa {targetBox + 1} possui apenas {targetEmptySlots.Count} vaga(s) disponível(is), mas {totalToMove} Pokémon foram selecionados.");

        var dstIndex = 0;
        foreach (var src in boxIndices)
        {
            var dst = targetEmptySlots[dstIndex++];
            var pkm = game.Trainer.PokemonBox.All[src].Pkm;
            game.Trainer.PokemonBox.Write(pkm, dst);
            game.Trainer.PokemonBox.Write(save.BlankPKM, src);
        }

        foreach (var slot in partySlots)
        {
            var dst = targetEmptySlots[dstIndex++];
            var pkm = game.Trainer.Party.Pokemons[slot].Pkm;
            game.Trainer.PokemonBox.Write(pkm, dst);
        }

        game.Trainer.PokemonBox.Reload();

        if (partySlots.Count > 0)
        {
            game.Trainer.Party.Remove(partySlots);
            session.AlsoWrote(Topics.Party);
        }
    }

    /// <summary>
    /// Moves one or more Pokémon from the box to the trainer's party.
    /// </summary>
    [Requires(Requirement.Save)]
    [Command("box.moveToParty", Topics.Box, Topics.Party)]
    public static void MoveToParty(Session session, Game game, PokemonHandle[] pokemons)
    {
        var save = game.SaveFile;
        if (save is SAV7b)
            throw new EngineException(ErrorCodes.NotSupported, "Saves de Let's Go gerenciam a equipe diretamente pelo Box.");

        var slotCount = save.BoxSlotCount;

        var boxIndices = pokemons
            .Where(p => p.Source == SlotSource.Box && p.Box.HasValue)
            .Select(p => p.Box!.Value * slotCount + p.Slot)
            .Where(idx => idx >= 0 && idx < game.Trainer.PokemonBox.All.Count && !game.Trainer.PokemonBox.All[idx].IsEmpty)
            .Distinct()
            .ToList();

        if (boxIndices.Count == 0) return;

        var currentPartyCount = game.Trainer.Party.Members().Count();
        var freeSlots = 6 - currentPartyCount;

        if (boxIndices.Count > freeSlots)
            throw new EngineException(ErrorCodes.BadArguments, $"A equipe possui apenas {freeSlots} vaga(s) disponível(is), mas {boxIndices.Count} Pokémon foram selecionados.");

        var toAdd = new List<PKM>();
        foreach (var src in boxIndices)
        {
            var pkm = game.Trainer.PokemonBox.All[src].Pkm.Clone();
            toAdd.Add(pkm);
            game.Trainer.PokemonBox.Write(save.BlankPKM, src);
        }

        game.Trainer.Party.Add(toAdd);
        game.Trainer.PokemonBox.Reload();
    }
}
