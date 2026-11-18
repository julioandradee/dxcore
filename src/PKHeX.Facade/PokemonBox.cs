using System.Collections.Immutable;
using PKHeX.Core;
using PKHeX.Facade.Abstractions;
using PKHeX.Facade.Extensions;
using PKHeX.Facade.Pokemons;

namespace PKHeX.Facade;

public class PokemonBox : IMutablePokemonCollection
{
    public PokemonBox(Game game, PokemonParty party)
    {
        _game = game;
        _party = party;

        PopulateFromSave();
    }

    private readonly Game _game;
    private readonly PokemonParty _party;
    private IList<Pokemon> _pokemonList = default!;
    private SlotSnapshot _snapshot = default!;

    public IDictionary<Species, List<Pokemon>> BySpecies { get; private set; } = default!;
    public IList<Pokemon> All => _pokemonList;

    public IReadOnlyList<Box> Boxes
    {
        get
        {
            var save = _game.SaveFile;
            var names = save as IBoxDetailName;
            return Enumerable.Range(0, save.BoxCount)
                .Select(number => new Box(number, names?.GetBoxName(number), save.BoxSlotCount))
                .ToList();
        }
    }

    public IEnumerable<(int Index, Pokemon Pokemon)> Boxed() => _pokemonList
        .Select((pokemon, index) => (index, pokemon))
        .Where(p => !p.pokemon.IsEmpty && !IsPartyMember(p.index));

    public string Showdown()
    {
        _game.Require(Capability.Showdown);
        return Boxed().Select(boxed => boxed.Pokemon).Showdown();
    }

    private bool IsPartyMember(int index) => _game.SaveFile is SAV7b { Blocks.Storage: var storage } && storage.IsParty(index);

    public void Commit()
    {
        for (var index = 0; index < _pokemonList.Count; index++)
            if (_snapshot.HasChanged(index, _pokemonList[index].Pkm) && !_game.SaveFile.IsBoxSlotOverwriteProtected(index))
                Write(_pokemonList[index].Pkm, index);

        foreach (var (index, pkm) in _party.BoxedMembers())
            if (_snapshot.HasChanged(index, pkm))
                Write(pkm, index);

        TakeSnapshot();
    }

    private void Write(PKM pkm, int index)
    {
        _game.SaveFile.SetBoxSlotAtIndex(pkm, index, EntityImportSettings.None);
        XDShadows.Write(_game.SaveFile, pkm);
    }

    public bool AddOnEmptySlot(Pokemon pokemon) => AddOnEmptySlot(pokemon, out _);

    public bool AddOnEmptySlot(Pokemon pokemon, out int index)
    {
        index = _game.SaveFile.NextOpenBoxSlot();
        if (index == -1) return false;

        _game.SaveFile.SetBoxSlotAtIndex(pokemon.Pkm, index);
        PopulateFromSave();

        return true;
    }

    internal void Remove(IEnumerable<int> indices)
    {
        foreach (var index in indices)
            _game.SaveFile.SetBoxSlotAtIndex(_game.SaveFile.BlankPKM, index, EntityImportSettings.None);
        PopulateFromSave();
    }

    internal void Place(IEnumerable<(PKM Pkm, int Index)> arrivals)
    {
        foreach (var (pkm, index) in arrivals)
            _game.SaveFile.SetBoxSlotAtIndex(pkm, index);
        PopulateFromSave();
    }

    internal void Reload() => PopulateFromSave();

    internal void MoveToBox(IReadOnlyList<int> sourceIndices, int targetBox)
    {
        var save = _game.SaveFile;
        if (targetBox < 0 || targetBox >= save.BoxCount)
            throw new ArgumentOutOfRangeException(nameof(targetBox), $"Caixa inválida: {targetBox + 1}. O save possui {save.BoxCount} caixas.");

        var slotCount = save.BoxSlotCount;
        var targetStart = targetBox * slotCount;

        // Distinct valid source indices not already in targetBox
        var validSources = sourceIndices
            .Where(idx => idx >= 0 && idx < _pokemonList.Count && !_pokemonList[idx].IsEmpty)
            .Where(idx => idx / slotCount != targetBox)
            .Distinct()
            .ToList();

        if (validSources.Count == 0) return;

        // Find empty slots in targetBox
        var targetEmptySlots = new List<int>();
        for (var s = 0; s < slotCount; s++)
        {
            var flat = targetStart + s;
            if (save.IsBoxSlotOverwriteProtected(flat)) continue;
            if (_pokemonList[flat].IsEmpty)
                targetEmptySlots.Add(flat);
        }

        if (validSources.Count > targetEmptySlots.Count)
        {
            throw new InvalidOperationException(
                $"A Caixa {targetBox + 1} possui apenas {targetEmptySlots.Count} vaga(s) disponível(is), mas {validSources.Count} Pokémon foram selecionados.");
        }

        for (var i = 0; i < validSources.Count; i++)
        {
            var src = validSources[i];
            var dst = targetEmptySlots[i];
            var pkm = _pokemonList[src].Pkm;

            Write(pkm, dst);
            Write(save.BlankPKM, src);
        }

        PopulateFromSave();
    }

    internal void SwapSlots(int indexA, int indexB)
    {
        if (indexA == indexB) return;
        var save = _game.SaveFile;
        if (indexA < 0 || indexA >= _pokemonList.Count || indexB < 0 || indexB >= _pokemonList.Count)
            throw new ArgumentOutOfRangeException("Posição de box inválida.");

        if (save.IsBoxSlotOverwriteProtected(indexA) || save.IsBoxSlotOverwriteProtected(indexB))
            throw new InvalidOperationException("Slot protegido contra sobrescrita.");

        var pkmA = _pokemonList[indexA].Pkm;
        var pkmB = _pokemonList[indexB].Pkm;

        Write(pkmB, indexA);
        Write(pkmA, indexB);

        PopulateFromSave();
    }

    internal void SharePartyMembers()
    {
        foreach (var (index, pkm) in _party.BoxedMembers())
            _pokemonList[index] = new Pokemon(pkm, _game);

        IndexBySpecies();
    }

    private void PopulateFromSave()
    {
        _pokemonList = _game.SaveFile.BoxData
            .Select(p => new Pokemon(p, _game))
            .ToList();
        TakeSnapshot();

        SharePartyMembers();
    }

    private void TakeSnapshot() => _snapshot = new SlotSnapshot(_pokemonList.Select(p => p.Pkm));

    private void IndexBySpecies()
    {
        BySpecies = _pokemonList
            .Where(p => p.Species != Species.None)
            .GroupBy(p => p.Species)
            .ToImmutableSortedDictionary(
                key => key.Key.Species,
                value => value.OrderByDescending(p => p.Level).ToList());
    }

    public void AddOrUpdate(UniqueId id, Pokemon pokemon)
    {
        var existing = _pokemonList.FirstOrDefault(p => p.UniqueId.Equals(id));

        if (existing is null) HandleAdd(pokemon);
        else HandleUpdate(existing, pokemon);
    }

    private void HandleAdd(Pokemon pokemon)
    {
        var added = AddOnEmptySlot(pokemon);
        if (!added) throw new InvalidOperationException("Pokemon box is full.");
    }

    private void HandleUpdate(Pokemon existing, Pokemon pokemon)
    {
        var index = _pokemonList.IndexOf(existing);
        _pokemonList[index] = pokemon;
        if (_party.SlotOf(index) is { } slot)
        {
            pokemon.Pkm.ResetPartyStats();
            _party.Replace(slot, pokemon.Pkm);
        }

        Commit();
        PopulateFromSave();
    }
}