using PKHeX.Core;

namespace PKHeX.Facade;

public record Badge(string Name, bool Earned);

public class Badges
{
    private static readonly string[] Kanto = ["Boulder", "Cascade", "Thunder", "Rainbow", "Soul", "Marsh", "Volcano", "Earth"];
    private static readonly string[] Johto = ["Zephyr", "Hive", "Plain", "Fog", "Storm", "Mineral", "Glacier", "Rising"];
    private static readonly string[] Hoenn = ["Stone", "Knuckle", "Dynamo", "Heat", "Balance", "Feather", "Mind", "Rain"];
    private static readonly string[] Sinnoh = ["Coal", "Forest", "Cobble", "Fen", "Relic", "Mine", "Icicle", "Beacon"];
    private static readonly string[] UnovaBW = ["Trio", "Basic", "Insect", "Bolt", "Quake", "Jet", "Freeze", "Legend"];
    private static readonly string[] UnovaB2W2 = ["Basic", "Toxic", "Insect", "Bolt", "Quake", "Jet", "Wave", "Legend"];
    private static readonly string[] Kalos = ["Bug", "Cliff", "Rumble", "Plant", "Voltage", "Fairy", "Psychic", "Iceberg"];

    private readonly string[] _names;
    private readonly Func<int> _get;
    private readonly Action<int> _set;

    private Badges(string[] names, Func<int> get, Action<int> set)
    {
        _names = names;
        _get = get;
        _set = set;
    }

    public IReadOnlyList<Badge> All
    {
        get
        {
            var earned = _get();
            return _names.Select((name, i) => new Badge(name, (earned & (1 << i)) != 0)).ToList();
        }
    }

    public void Set(IReadOnlyList<bool> earned)
    {
        if (earned.Count != _names.Length)
            throw new ArgumentOutOfRangeException(nameof(earned), $"This save has {_names.Length} badges, got {earned.Count}.");

        _set(earned.Select((e, i) => e ? 1 << i : 0).Sum());
    }

    internal static Badges? Of(SaveFile save) => save switch
    {
        SAV1 gen1 => new Badges(Kanto, () => gen1.Badges, value => gen1.Badges = value),
        SAV2 gen2 => new Badges([..Johto, ..Kanto], () => gen2.Badges, value => gen2.Badges = value),
        SAV3FRLG frlg => new Badges(Kanto, () => frlg.Badges, value => frlg.Badges = value),
        SAV3 gen3 => new Badges(Hoenn, () => gen3.Badges, value => gen3.Badges = value),
        SAV4HGSS hgss => new Badges([..Johto, ..Kanto], () => hgss.Badges | (hgss.Badges16 << 8), value => { hgss.Badges = (byte)value; hgss.Badges16 = (byte)(value >> 8); }),
        SAV4Sinnoh sinnoh => new Badges(Sinnoh, () => sinnoh.Badges, value => sinnoh.Badges = (byte)value),
        SAV5B2W2 b2w2 => new Badges(UnovaB2W2, () => b2w2.Misc.Badges, value => b2w2.Misc.Badges = value),
        SAV5 gen5 => new Badges(UnovaBW, () => gen5.Misc.Badges, value => gen5.Misc.Badges = value),
        SAV6XY xy => new Badges(Kalos, () => xy.Badges, value => xy.Badges = value),
        SAV6AO ao => new Badges(Hoenn, () => ao.Badges, value => ao.Badges = value),
        _ => null,
    };
}
