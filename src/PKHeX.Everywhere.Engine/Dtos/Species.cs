using PKHeX.Facade.Repositories;

namespace PKHeX.Everywhere.Engine.Dtos;

/// <summary>
/// A species that exists in the loaded save's game, as listed by <c>species.list</c>.
/// </summary>
/// <param name="Id">The species' National Pokédex number, as PKHeX.Core numbers species.</param>
public record SpeciesEntry(int Id, string Name);

/// <summary>
/// A species in the game's Pokédex with its seen and caught status in the save file and its types.
/// </summary>
public record PokedexSpeciesEntry(int Id, string Name, bool Seen, bool Caught, int[] Types);

public static class SpeciesMapping
{
    public static SpeciesEntry ToEntry(this SpeciesDefinition species) => new(species.Id, species.Name);
}
