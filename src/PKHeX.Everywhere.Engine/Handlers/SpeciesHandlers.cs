using PKHeX.Core;
using PKHeX.Everywhere.Engine.Dtos;
using PKHeX.Facade;
using PKHeX.Facade.Repositories;

namespace PKHeX.Everywhere.Engine.Handlers;

public static class SpeciesHandlers
{
    [Query("species.list", Topics.Game)]
    public static SpeciesEntry[] List(Game game) => game.SpeciesRepository.AllGameSpecies
        .Where(SpeciesDefinition.IsSome)
        .OrderBy(species => species.Name, StringComparer.Ordinal)
        .Select(species => species.ToEntry())
        .ToArray();

    [Query("species.pokedex", Topics.Game, Topics.Party, Topics.Box)]
    public static PokedexSpeciesEntry[] Pokedex(Game game)
    {
        var sav = game.SaveFile;
        bool hasDex = sav.HasPokeDex;
        return game.SpeciesRepository.AllGameSpecies
            .Where(SpeciesDefinition.IsSome)
            .OrderBy(species => species.Id)
            .Select(species =>
            {
                bool seen = false;
                bool caught = false;
                if (hasDex && species.Id > 0 && species.Id <= sav.MaxSpeciesID)
                {
                    try
                    {
                        seen = sav.GetSeen((ushort)species.Id);
                        caught = sav.GetCaught((ushort)species.Id);
                    }
                    catch
                    {
                        // Fallback
                    }
                }

                int[] types = [];
                try
                {
                    var pi = sav.Personal.GetFormEntry((ushort)species.Id, 0);
                    int t1 = (int)((MoveType)pi.Type1).GetMoveTypeGeneration(sav.Generation);
                    int t2 = (int)((MoveType)pi.Type2).GetMoveTypeGeneration(sav.Generation);
                    types = t1 == t2 ? [t1] : [t1, t2];
                }
                catch
                {
                    // Fallback
                }

                return new PokedexSpeciesEntry(species.Id, species.Name, seen, caught, types);
            })
            .ToArray();
    }
}
