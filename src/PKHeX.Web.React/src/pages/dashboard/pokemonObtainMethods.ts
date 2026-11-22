export interface ObtainInfo {
  method: 'wild' | 'evolution' | 'trade' | 'item_trade' | 'stone' | 'friendship' | 'fossil' | 'gift' | 'legendary' | 'exclusive' | 'breeding'
  title: string
  description: string
  preEvolutionId?: number
  preEvolutionName?: string
  requiredItem?: string
  requiredLevel?: number
  exclusiveGame?: string
}

// Obtainment knowledge for Gen 1, 2, and 3 species (National Dex 1-386)
export const OBTAIN_METHODS_MAP: Record<number, ObtainInfo> = {
  // Starters Kanto
  2: { method: 'evolution', title: 'Evolução por Nível', description: 'Evolui de Bulbasaur ao atingir o Nível 16.', preEvolutionId: 1, preEvolutionName: 'Bulbasaur', requiredLevel: 16 },
  3: { method: 'evolution', title: 'Evolução por Nível', description: 'Evolui de Ivysaur ao atingir o Nível 32.', preEvolutionId: 2, preEvolutionName: 'Ivysaur', requiredLevel: 32 },
  5: { method: 'evolution', title: 'Evolução por Nível', description: 'Evolui de Charmander ao atingir o Nível 16.', preEvolutionId: 4, preEvolutionName: 'Charmander', requiredLevel: 16 },
  6: { method: 'evolution', title: 'Evolução por Nível', description: 'Evolui de Charmeleon ao atingir o Nível 36.', preEvolutionId: 5, preEvolutionName: 'Charmeleon', requiredLevel: 36 },
  8: { method: 'evolution', title: 'Evolução por Nível', description: 'Evolui de Squirtle ao atingir o Nível 16.', preEvolutionId: 7, preEvolutionName: 'Squirtle', requiredLevel: 16 },
  9: { method: 'evolution', title: 'Evolução por Nível', description: 'Evolui de Wartortle ao atingir o Nível 36.', preEvolutionId: 8, preEvolutionName: 'Wartortle', requiredLevel: 36 },

  // Caterpie / Weedle / Pidgey lines
  11: { method: 'evolution', title: 'Evolução por Nível', description: 'Evolui de Caterpie ao atingir o Nível 7.', preEvolutionId: 10, preEvolutionName: 'Caterpie', requiredLevel: 7 },
  12: { method: 'evolution', title: 'Evolução por Nível', description: 'Evolui de Metapod ao atingir o Nível 10.', preEvolutionId: 11, preEvolutionName: 'Metapod', requiredLevel: 10 },
  14: { method: 'evolution', title: 'Evolução por Nível', description: 'Evolui de Weedle ao atingir o Nível 7.', preEvolutionId: 13, preEvolutionName: 'Weedle', requiredLevel: 7 },
  15: { method: 'evolution', title: 'Evolução por Nível', description: 'Evolui de Kakuna ao atingir o Nível 10.', preEvolutionId: 14, preEvolutionName: 'Kakuna', requiredLevel: 10 },
  17: { method: 'evolution', title: 'Evolução por Nível', description: 'Evolui de Pidgey ao atingir o Nível 18.', preEvolutionId: 16, preEvolutionName: 'Pidgey', requiredLevel: 18 },
  18: { method: 'evolution', title: 'Evolução por Nível', description: 'Evolui de Pidgeotto ao atingir o Nível 36.', preEvolutionId: 17, preEvolutionName: 'Pidgeotto', requiredLevel: 36 },
  20: { method: 'evolution', title: 'Evolução por Nível', description: 'Evolui de Rattata ao atingir o Nível 20.', preEvolutionId: 19, preEvolutionName: 'Rattata', requiredLevel: 20 },
  22: { method: 'evolution', title: 'Evolução por Nível', description: 'Evolui de Spearow ao atingir o Nível 20.', preEvolutionId: 21, preEvolutionName: 'Spearow', requiredLevel: 20 },
  24: { method: 'evolution', title: 'Evolução por Nível', description: 'Evolui de Ekans ao atingir o Nível 22.', preEvolutionId: 23, preEvolutionName: 'Ekans', requiredLevel: 22 },

  // Pikachu / Raichu
  25: { method: 'friendship', title: 'Evolução por Felicidade', description: 'Evolui de Pichu com alta amizade (Felicidade 220+), ou capturado selvagem na Safari Zone.', preEvolutionId: 172, preEvolutionName: 'Pichu' },
  26: { method: 'stone', title: 'Evolução por Pedra Elemental', description: 'Evolui de Pikachu usando uma Pedra do Trovão (Thunder Stone).', preEvolutionId: 25, preEvolutionName: 'Pikachu', requiredItem: 'Thunder Stone' },

  // Sandshrew
  28: { method: 'evolution', title: 'Evolução por Nível', description: 'Evolui de Sandshrew ao atingir o Nível 22.', preEvolutionId: 27, preEvolutionName: 'Sandshrew', requiredLevel: 22 },

  // Nido lines
  30: { method: 'evolution', title: 'Evolução por Nível', description: 'Evolui de Nidoran♀ ao atingir o Nível 16.', preEvolutionId: 29, preEvolutionName: 'Nidoran♀', requiredLevel: 16 },
  31: { method: 'stone', title: 'Evolução por Pedra Elemental', description: 'Evolui de Nidorina usando uma Pedra da Lua (Moon Stone).', preEvolutionId: 30, preEvolutionName: 'Nidorina', requiredItem: 'Moon Stone' },
  33: { method: 'evolution', title: 'Evolução por Nível', description: 'Evolui de Nidoran♂ ao atingir o Nível 16.', preEvolutionId: 32, preEvolutionName: 'Nidoran♂', requiredLevel: 16 },
  34: { method: 'stone', title: 'Evolução por Pedra Elemental', description: 'Evolui de Nidorino usando uma Pedra da Lua (Moon Stone).', preEvolutionId: 33, preEvolutionName: 'Nidorino', requiredItem: 'Moon Stone' },

  // Clefairy / Clefable
  35: { method: 'friendship', title: 'Evolução por Felicidade', description: 'Evolui de Cleffa com alta amizade, ou capturado selvagem.', preEvolutionId: 173, preEvolutionName: 'Cleffa' },
  36: { method: 'stone', title: 'Evolução por Pedra Elemental', description: 'Evolui de Clefairy usando uma Pedra da Lua (Moon Stone).', preEvolutionId: 35, preEvolutionName: 'Clefairy', requiredItem: 'Moon Stone' },

  // Vulpix / Ninetales
  38: { method: 'stone', title: 'Evolução por Pedra Elemental', description: 'Evolui de Vulpix usando uma Pedra do Fogo (Fire Stone).', preEvolutionId: 37, preEvolutionName: 'Vulpix', requiredItem: 'Fire Stone' },

  // Jigglypuff / Wigglytuff
  39: { method: 'friendship', title: 'Evolução por Felicidade', description: 'Evolui de Igglybuff com alta amizade, ou capturado selvagem na Rota 115.', preEvolutionId: 174, preEvolutionName: 'Igglybuff' },
  40: { method: 'stone', title: 'Evolução por Pedra Elemental', description: 'Evolui de Jigglypuff usando uma Pedra da Lua (Moon Stone).', preEvolutionId: 39, preEvolutionName: 'Jigglypuff', requiredItem: 'Moon Stone' },

  // Zubat line
  42: { method: 'evolution', title: 'Evolução por Nível', description: 'Evolui de Zubat ao atingir o Nível 22.', preEvolutionId: 41, preEvolutionName: 'Zubat', requiredLevel: 22 },
  169: { method: 'friendship', title: 'Evolução por Amizade', description: 'Evolui de Golbat ao subir de nível com alta amizade (Felicidade 220+).', preEvolutionId: 42, preEvolutionName: 'Golbat' },

  // Oddish line
  44: { method: 'evolution', title: 'Evolução por Nível', description: 'Evolui de Oddish ao atingir o Nível 21.', preEvolutionId: 43, preEvolutionName: 'Oddish', requiredLevel: 21 },
  45: { method: 'stone', title: 'Evolução por Pedra Elemental', description: 'Evolui de Gloom usando uma Pedra da Folha (Leaf Stone).', preEvolutionId: 44, preEvolutionName: 'Gloom', requiredItem: 'Leaf Stone' },
  182: { method: 'stone', title: 'Evolução por Pedra Elemental', description: 'Evolui de Gloom usando uma Pedra do Sol (Sun Stone).', preEvolutionId: 44, preEvolutionName: 'Gloom', requiredItem: 'Sun Stone' },

  // Parasect / Venomoth / Dugtrio / Persian / Golduck / Primeape
  47: { method: 'evolution', title: 'Evolução por Nível', description: 'Evolui de Paras ao atingir o Nível 24.', preEvolutionId: 46, preEvolutionName: 'Paras', requiredLevel: 24 },
  49: { method: 'evolution', title: 'Evolução por Nível', description: 'Evolui de Venonat ao atingir o Nível 31.', preEvolutionId: 48, preEvolutionName: 'Venonat', requiredLevel: 31 },
  51: { method: 'evolution', title: 'Evolução por Nível', description: 'Evolui de Diglett ao atingir o Nível 26.', preEvolutionId: 50, preEvolutionName: 'Diglett', requiredLevel: 26 },
  53: { method: 'evolution', title: 'Evolução por Nível', description: 'Evolui de Meowth ao atingir o Nível 28.', preEvolutionId: 52, preEvolutionName: 'Meowth', requiredLevel: 28 },
  55: { method: 'evolution', title: 'Evolução por Nível', description: 'Evolui de Psyduck ao atingir o Nível 33.', preEvolutionId: 54, preEvolutionName: 'Psyduck', requiredLevel: 33 },
  57: { method: 'evolution', title: 'Evolução por Nível', description: 'Evolui de Mankey ao atingir o Nível 28.', preEvolutionId: 56, preEvolutionName: 'Mankey', requiredLevel: 28 },
  59: { method: 'stone', title: 'Evolução por Pedra Elemental', description: 'Evolui de Growlithe usando uma Pedra do Fogo (Fire Stone).', preEvolutionId: 58, preEvolutionName: 'Growlithe', requiredItem: 'Fire Stone' },

  // Poliwag line
  61: { method: 'evolution', title: 'Evolução por Nível', description: 'Evolui de Poliwag ao atingir o Nível 25.', preEvolutionId: 60, preEvolutionName: 'Poliwag', requiredLevel: 25 },
  62: { method: 'stone', title: 'Evolução por Pedra Elemental', description: 'Evolui de Poliwhirl usando uma Pedra da Água (Water Stone).', preEvolutionId: 61, preEvolutionName: 'Poliwhirl', requiredItem: 'Water Stone' },
  186: { method: 'item_trade', title: 'Evolução por Troca com Item', description: 'Evolui de Poliwhirl ao ser trocado segurando a King\'s Rock.', preEvolutionId: 61, preEvolutionName: 'Poliwhirl', requiredItem: "King's Rock" },

  // Abra line (Trade)
  64: { method: 'evolution', title: 'Evolução por Nível', description: 'Evolui de Abra ao atingir o Nível 16.', preEvolutionId: 63, preEvolutionName: 'Abra', requiredLevel: 16 },
  65: { method: 'trade', title: 'Evolução por Troca (Trade)', description: 'Evolui de Kadabra ao ser trocado com outro jogador/cartucho.', preEvolutionId: 64, preEvolutionName: 'Kadabra' },

  // Machop line (Trade)
  67: { method: 'evolution', title: 'Evolução por Nível', description: 'Evolui de Machop ao atingir o Nível 28.', preEvolutionId: 66, preEvolutionName: 'Machop', requiredLevel: 28 },
  68: { method: 'trade', title: 'Evolução por Troca (Trade)', description: 'Evolui de Machoke ao ser trocado com outro jogador/cartucho.', preEvolutionId: 67, preEvolutionName: 'Machoke' },

  // Bellsprout line
  70: { method: 'evolution', title: 'Evolução por Nível', description: 'Evolui de Bellsprout ao atingir o Nível 21.', preEvolutionId: 69, preEvolutionName: 'Bellsprout', requiredLevel: 21 },
  71: { method: 'stone', title: 'Evolução por Pedra Elemental', description: 'Evolui de Weepinbell usando uma Pedra da Folha (Leaf Stone).', preEvolutionId: 70, preEvolutionName: 'Weepinbell', requiredItem: 'Leaf Stone' },

  // Tentacool / Geodude line (Trade)
  73: { method: 'evolution', title: 'Evolução por Nível', description: 'Evolui de Tentacool ao atingir o Nível 30.', preEvolutionId: 72, preEvolutionName: 'Tentacool', requiredLevel: 30 },
  75: { method: 'evolution', title: 'Evolução por Nível', description: 'Evolui de Geodude ao atingir o Nível 25.', preEvolutionId: 74, preEvolutionName: 'Geodude', requiredLevel: 25 },
  76: { method: 'trade', title: 'Evolução por Troca (Trade)', description: 'Evolui de Graveler ao ser trocado com outro jogador/cartucho.', preEvolutionId: 75, preEvolutionName: 'Graveler' },

  // Slowpoke line
  80: { method: 'evolution', title: 'Evolução por Nível', description: 'Evolui de Slowpoke ao atingir o Nível 37.', preEvolutionId: 79, preEvolutionName: 'Slowpoke', requiredLevel: 37 },
  199: { method: 'item_trade', title: 'Evolução por Troca com Item', description: 'Evolui de Slowpoke ao ser trocado segurando a King\'s Rock.', preEvolutionId: 79, preEvolutionName: 'Slowpoke', requiredItem: "King's Rock" },

  // Gastly line (Trade)
  93: { method: 'evolution', title: 'Evolução por Nível', description: 'Evolui de Gastly ao atingir o Nível 25.', preEvolutionId: 92, preEvolutionName: 'Gastly', requiredLevel: 25 },
  94: { method: 'trade', title: 'Evolução por Troca (Trade)', description: 'Evolui de Haunter ao ser trocado com outro jogador/cartucho.', preEvolutionId: 93, preEvolutionName: 'Haunter' },

  // Onix / Steelix (Trade)
  208: { method: 'item_trade', title: 'Evolução por Troca com Item', description: 'Evolui de Onix ao ser trocado segurando o Metal Coat.', preEvolutionId: 95, preEvolutionName: 'Onix', requiredItem: 'Metal Coat' },

  // Shellder / Cloyster
  91: { method: 'stone', title: 'Evolução por Pedra Elemental', description: 'Evolui de Shellder usando uma Pedra da Água (Water Stone).', preEvolutionId: 90, preEvolutionName: 'Shellder', requiredItem: 'Water Stone' },

  // Exeggcute / Exeggutor
  103: { method: 'stone', title: 'Evolução por Pedra Elemental', description: 'Evolui de Exeggcute usando uma Pedra da Folha (Leaf Stone).', preEvolutionId: 102, preEvolutionName: 'Exeggcute', requiredItem: 'Leaf Stone' },

  // Hitmons (Tyrogue)
  106: { method: 'evolution', title: 'Evolução por Atributo', description: 'Evolui de Tyrogue no Nível 20 se o atributo de Ataque for maior que a Defesa (Atq > Def).', preEvolutionId: 236, preEvolutionName: 'Tyrogue', requiredLevel: 20 },
  107: { method: 'evolution', title: 'Evolução por Atributo', description: 'Evolui de Tyrogue no Nível 20 se a Defesa for maior que o Ataque (Def > Atq).', preEvolutionId: 236, preEvolutionName: 'Tyrogue', requiredLevel: 20 },
  237: { method: 'evolution', title: 'Evolução por Atributo', description: 'Evolui de Tyrogue no Nível 20 se Ataque e Defesa forem rigorosamente iguais (Atq == Def).', preEvolutionId: 236, preEvolutionName: 'Tyrogue', requiredLevel: 20 },

  // Chansey / Blissey
  242: { method: 'friendship', title: 'Evolução por Amizade', description: 'Evolui de Chansey ao subir de nível com alta amizade (Felicidade 220+).', preEvolutionId: 113, preEvolutionName: 'Chansey' },

  // Horsea / Seadra / Kingdra (Trade)
  117: { method: 'evolution', title: 'Evolução por Nível', description: 'Evolui de Horsea ao atingir o Nível 32.', preEvolutionId: 116, preEvolutionName: 'Horsea', requiredLevel: 32 },
  230: { method: 'item_trade', title: 'Evolução por Troca com Item', description: 'Evolui de Seadra ao ser trocado segurando a Dragon Scale.', preEvolutionId: 117, preEvolutionName: 'Seadra', requiredItem: 'Dragon Scale' },

  // Staryu / Starmie
  121: { method: 'stone', title: 'Evolução por Pedra Elemental', description: 'Evolui de Staryu usando uma Pedra da Água (Water Stone).', preEvolutionId: 120, preEvolutionName: 'Staryu', requiredItem: 'Water Stone' },

  // Scyther / Scizor (Trade)
  212: { method: 'item_trade', title: 'Evolução por Troca com Item', description: 'Evolui de Scyther ao ser trocado segurando o Metal Coat.', preEvolutionId: 123, preEvolutionName: 'Scyther', requiredItem: 'Metal Coat' },

  // Gyarados
  130: { method: 'evolution', title: 'Evolução por Nível', description: 'Evolui de Magikarp ao atingir o Nível 20.', preEvolutionId: 129, preEvolutionName: 'Magikarp', requiredLevel: 20 },

  // Eeveelutions
  134: { method: 'stone', title: 'Evolução por Pedra Elemental', description: 'Evolui de Eevee usando uma Pedra da Água (Water Stone).', preEvolutionId: 133, preEvolutionName: 'Eevee', requiredItem: 'Water Stone' },
  135: { method: 'stone', title: 'Evolução por Pedra Elemental', description: 'Evolui de Eevee usando uma Pedra do Trovão (Thunder Stone).', preEvolutionId: 133, preEvolutionName: 'Eevee', requiredItem: 'Thunder Stone' },
  136: { method: 'stone', title: 'Evolução por Pedra Elemental', description: 'Evolui de Eevee usando uma Pedra do Fogo (Fire Stone).', preEvolutionId: 133, preEvolutionName: 'Eevee', requiredItem: 'Fire Stone' },
  196: { method: 'friendship', title: 'Evolução por Amizade (Dia)', description: 'Evolui de Eevee com alta amizade (Felicidade 220+) durante o período diurno.', preEvolutionId: 133, preEvolutionName: 'Eevee' },
  197: { method: 'friendship', title: 'Evolução por Amizade (Noite)', description: 'Evolui de Eevee com alta amizade (Felicidade 220+) durante o período noturno.', preEvolutionId: 133, preEvolutionName: 'Eevee' },

  // Porygon2 (Trade)
  233: { method: 'item_trade', title: 'Evolução por Troca com Item', description: 'Evolui de Porygon ao ser trocado segurando o Up-Grade.', preEvolutionId: 137, preEvolutionName: 'Porygon', requiredItem: 'Up-Grade' },

  // Fossils Kanto
  138: { method: 'fossil', title: 'Fóssil Antigo', description: 'Reviva o Helix Fossil no Laboratório de Cinnabar Island (Kanto).' },
  139: { method: 'evolution', title: 'Evolução por Nível', description: 'Evolui de Omanyte ao atingir o Nível 40.', preEvolutionId: 138, preEvolutionName: 'Omanyte', requiredLevel: 40 },
  140: { method: 'fossil', title: 'Fóssil Antigo', description: 'Reviva o Dome Fossil no Laboratório de Cinnabar Island (Kanto).' },
  141: { method: 'evolution', title: 'Evolução por Nível', description: 'Evolui de Kabuto ao atingir o Nível 40.', preEvolutionId: 140, preEvolutionName: 'Kabuto', requiredLevel: 40 },
  142: { method: 'fossil', title: 'Fóssil Antigo', description: 'Reviva o Old Amber no Laboratório de Cinnabar Island (Kanto).' },

  // Dratini / Dragonite
  148: { method: 'evolution', title: 'Evolução por Nível', description: 'Evolui de Dratini ao atingir o Nível 30.', preEvolutionId: 147, preEvolutionName: 'Dratini', requiredLevel: 30 },
  149: { method: 'evolution', title: 'Evolução por Nível', description: 'Evolui de Dragonair ao atingir o Nível 55.', preEvolutionId: 148, preEvolutionName: 'Dragonair', requiredLevel: 55 },

  // Legendaries Kanto
  144: { method: 'legendary', title: 'Lendário Estático', description: 'Encontro estático nas profundezas da Seafoam Islands (Kanto).' },
  145: { method: 'legendary', title: 'Lendário Estático', description: 'Encontro estático na Usina Elétrica (Power Plant - Kanto).' },
  146: { method: 'legendary', title: 'Lendário Estático', description: 'Encontro estático no final da Victory Road (Kanto).' },
  150: { method: 'legendary', title: 'Lendário Estático', description: 'Encontro estático na Cerulean Cave (Kanto) após vencer a Elite Four.' },
  151: { method: 'gift', title: 'Pokémon Mítico', description: 'Obtido originalmente através de Eventos da Nintendo (Faraway Island com Old Sea Map).' },

  // Starters Johto
  153: { method: 'evolution', title: 'Evolução por Nível', description: 'Evolui de Chikorita ao atingir o Nível 16.', preEvolutionId: 152, preEvolutionName: 'Chikorita', requiredLevel: 16 },
  154: { method: 'evolution', title: 'Evolução por Nível', description: 'Evolui de Bayleef ao atingir o Nível 32.', preEvolutionId: 153, preEvolutionName: 'Bayleef', requiredLevel: 32 },
  156: { method: 'evolution', title: 'Evolução por Nível', description: 'Evolui de Cyndaquil ao atingir o Nível 14.', preEvolutionId: 155, preEvolutionName: 'Cyndaquil', requiredLevel: 14 },
  157: { method: 'evolution', title: 'Evolução por Nível', description: 'Evolui de Quilava ao atingir o Nível 36.', preEvolutionId: 156, preEvolutionName: 'Quilava', requiredLevel: 36 },
  159: { method: 'evolution', title: 'Evolução por Nível', description: 'Evolui de Totodile ao atingir o Nível 18.', preEvolutionId: 158, preEvolutionName: 'Totodile', requiredLevel: 18 },
  160: { method: 'evolution', title: 'Evolução por Nível', description: 'Evolui de Croconaw ao atingir o Nível 30.', preEvolutionId: 159, preEvolutionName: 'Croconaw', requiredLevel: 30 },

  // Larvitar / Tyranitar
  247: { method: 'evolution', title: 'Evolução por Nível', description: 'Evolui de Larvitar ao atingir o Nível 30.', preEvolutionId: 246, preEvolutionName: 'Larvitar', requiredLevel: 30 },
  248: { method: 'evolution', title: 'Evolução por Nível', description: 'Evolui de Pupitar ao atingir o Nível 55.', preEvolutionId: 247, preEvolutionName: 'Pupitar', requiredLevel: 55 },

  // Starters Hoenn
  253: { method: 'evolution', title: 'Evolução por Nível', description: 'Evolui de Treecko ao atingir o Nível 16.', preEvolutionId: 252, preEvolutionName: 'Treecko', requiredLevel: 16 },
  254: { method: 'evolution', title: 'Evolução por Nível', description: 'Evolui de Grovyle ao atingir o Nível 36.', preEvolutionId: 253, preEvolutionName: 'Grovyle', requiredLevel: 36 },
  256: { method: 'evolution', title: 'Evolução por Nível', description: 'Evolui de Torchic ao atingir o Nível 16.', preEvolutionId: 255, preEvolutionName: 'Torchic', requiredLevel: 16 },
  257: { method: 'evolution', title: 'Evolução por Nível', description: 'Evolui de Combusken ao atingir o Nível 36.', preEvolutionId: 256, preEvolutionName: 'Combusken', requiredLevel: 36 },
  259: { method: 'evolution', title: 'Evolução por Nível', description: 'Evolui de Mudkip ao atingir o Nível 16.', preEvolutionId: 258, preEvolutionName: 'Mudkip', requiredLevel: 16 },
  260: { method: 'evolution', title: 'Evolução por Nível', description: 'Evolui de Marshtomp ao atingir o Nível 36.', preEvolutionId: 259, preEvolutionName: 'Marshtomp', requiredLevel: 36 },

  // Hoenn Lotad / Seedot lines (Version exclusives)
  270: { method: 'exclusive', title: 'Exclusivo de Versão', description: 'Selvagem comum em Pokémon Sapphire e Emerald (Rotas 102 e 114). Em Pokémon Ruby, requer troca.', exclusiveGame: 'Sapphire / Emerald' },
  271: { method: 'evolution', title: 'Evolução por Nível', description: 'Evolui de Lotad ao atingir o Nível 14.', preEvolutionId: 270, preEvolutionName: 'Lotad', requiredLevel: 14 },
  272: { method: 'stone', title: 'Evolução por Pedra Elemental', description: 'Evolui de Lombre usando uma Pedra da Água (Water Stone).', preEvolutionId: 271, preEvolutionName: 'Lombre', requiredItem: 'Water Stone' },
  273: { method: 'exclusive', title: 'Exclusivo de Versão', description: 'Selvagem comum em Pokémon Ruby e Emerald (Rotas 102 e 114). Em Pokémon Sapphire, requer troca.', exclusiveGame: 'Ruby / Emerald' },
  274: { method: 'evolution', title: 'Evolução por Nível', description: 'Evolui de Seedot ao atingir o Nível 14.', preEvolutionId: 273, preEvolutionName: 'Seedot', requiredLevel: 14 },
  275: { method: 'stone', title: 'Evolução por Pedra Elemental', description: 'Evolui de Nuzleaf usando uma Pedra da Folha (Leaf Stone).', preEvolutionId: 274, preEvolutionName: 'Nuzleaf', requiredItem: 'Leaf Stone' },

  // Ralts line
  281: { method: 'evolution', title: 'Evolução por Nível', description: 'Evolui de Ralts ao atingir o Nível 20.', preEvolutionId: 280, preEvolutionName: 'Ralts', requiredLevel: 20 },
  282: { method: 'evolution', title: 'Evolução por Nível', description: 'Evolui de Kirlia ao atingir o Nível 30.', preEvolutionId: 281, preEvolutionName: 'Kirlia', requiredLevel: 30 },

  // Slakoth line
  288: { method: 'evolution', title: 'Evolução por Nível', description: 'Evolui de Slakoth ao atingir o Nível 18.', preEvolutionId: 287, preEvolutionName: 'Slakoth', requiredLevel: 18 },
  289: { method: 'evolution', title: 'Evolução por Nível', description: 'Evolui de Vigoroth ao atingir o Nível 36.', preEvolutionId: 288, preEvolutionName: 'Vigoroth', requiredLevel: 36 },

  // Nincada / Shedinja
  291: { method: 'evolution', title: 'Evolução por Nível', description: 'Evolui de Nincada ao atingir o Nível 20.', preEvolutionId: 290, preEvolutionName: 'Nincada', requiredLevel: 20 },
  292: { method: 'evolution', title: 'Evolução Especial', description: 'Aparece misteriosamente no time ao evoluir Nincada no Nv. 20 (é necessário ter pelo menos 1 vaga livre na equipe e 1 Pokébola comum no inventário).', preEvolutionId: 290, preEvolutionName: 'Nincada' },

  // Skitty / Delcatty
  301: { method: 'stone', title: 'Evolução por Pedra Elemental', description: 'Evolui de Skitty usando uma Pedra da Lua (Moon Stone).', preEvolutionId: 300, preEvolutionName: 'Skitty', requiredItem: 'Moon Stone' },

  // Sableye / Mawile (Version exclusives)
  302: { method: 'exclusive', title: 'Exclusivo de Versão', description: 'Selvagem na Granite Cave e Cave of Origin em Pokémon Sapphire e Emerald. Requer troca em Ruby.', exclusiveGame: 'Sapphire / Emerald' },
  303: { method: 'exclusive', title: 'Exclusivo de Versão', description: 'Selvagem na Granite Cave e Cave of Origin em Pokémon Ruby e Emerald. Requer troca em Sapphire.', exclusiveGame: 'Ruby / Emerald' },

  // Aron line
  305: { method: 'evolution', title: 'Evolução por Nível', description: 'Evolui de Aron ao atingir o Nível 32.', preEvolutionId: 304, preEvolutionName: 'Aron', requiredLevel: 32 },
  306: { method: 'evolution', title: 'Evolução por Nível', description: 'Evolui de Lairon ao atingir o Nível 42.', preEvolutionId: 305, preEvolutionName: 'Lairon', requiredLevel: 42 },

  // Trapinch / Flygon
  329: { method: 'evolution', title: 'Evolução por Nível', description: 'Evolui de Trapinch ao atingir o Nível 35.', preEvolutionId: 328, preEvolutionName: 'Trapinch', requiredLevel: 35 },
  330: { method: 'evolution', title: 'Evolução por Nível', description: 'Evolui de Vibrava ao atingir o Nível 45.', preEvolutionId: 329, preEvolutionName: 'Vibrava', requiredLevel: 45 },

  // Zangoose / Seviper (Exclusives)
  335: { method: 'exclusive', title: 'Exclusivo de Versão', description: 'Selvagem na Rota 114 em Pokémon Ruby. Em Pokémon Sapphire e Emerald, requer troca.', exclusiveGame: 'Ruby' },
  336: { method: 'exclusive', title: 'Exclusivo de Versão', description: 'Selvagem na Rota 114 em Pokémon Sapphire e Emerald. Em Pokémon Ruby, requer troca.', exclusiveGame: 'Sapphire / Emerald' },

  // Lunatone / Solrock (Exclusives)
  337: { method: 'exclusive', title: 'Exclusivo de Versão', description: 'Selvagem na Meteor Falls em Pokémon Sapphire. Em Pokémon Ruby e Emerald, requer troca.', exclusiveGame: 'Sapphire' },
  338: { method: 'exclusive', title: 'Exclusivo de Versão', description: 'Selvagem na Meteor Falls em Pokémon Ruby e Emerald. Em Pokémon Sapphire, requer troca.', exclusiveGame: 'Ruby / Emerald' },

  // Fossils Hoenn
  345: { method: 'fossil', title: 'Fóssil Raiz (Root Fossil)', description: 'Reviva o Root Fossil encontrado no Mirage Tower / Desert no laboratório da Devon Corp em Rustboro City.' },
  346: { method: 'evolution', title: 'Evolução por Nível', description: 'Evolui de Lileep ao atingir o Nível 40.', preEvolutionId: 345, preEvolutionName: 'Lileep', requiredLevel: 40 },
  347: { method: 'fossil', title: 'Fóssil Garra (Claw Fossil)', description: 'Reviva o Claw Fossil encontrado no Mirage Tower / Desert no laboratório da Devon Corp em Rustboro City.' },
  348: { method: 'evolution', title: 'Evolução por Nível', description: 'Evolui de Anorith ao atingir o Nível 40.', preEvolutionId: 347, preEvolutionName: 'Anorith', requiredLevel: 40 },

  // Feebas / Milotic
  349: { method: 'wild', title: 'Pesca Muito Rara', description: 'Pescado com Super Rod na Rota 119. Aparece apenas em 6 blocos aleatórios de água que mudam com a Trendy Phrase de Dewford.' },
  350: { method: 'friendship', title: 'Evolução por Beleza (Beauty)', description: 'Evolui de Feebas ao subir de nível após maximizar a condição de Beleza (Beauty 170+) usando Pokéblocks azuis/índigo feitos com Chesto/Oran/Wiki Berries.', preEvolutionId: 349, preEvolutionName: 'Feebas' },

  // Clamperl lines (Trade)
  367: { method: 'item_trade', title: 'Evolução por Troca com Item', description: 'Evolui de Clamperl ao ser trocado segurando o Deep Sea Tooth (escolhido no Abandoned Ship com Capt. Stern).', preEvolutionId: 366, preEvolutionName: 'Clamperl', requiredItem: 'Deep Sea Tooth' },
  368: { method: 'item_trade', title: 'Evolução por Troca com Item', description: 'Evolui de Clamperl ao ser trocado segurando o Deep Sea Scale (escolhido no Abandoned Ship com Capt. Stern).', preEvolutionId: 366, preEvolutionName: 'Clamperl', requiredItem: 'Deep Sea Scale' },

  // Spheal / Walrein
  364: { method: 'evolution', title: 'Evolução por Nível', description: 'Evolui de Spheal ao atingir o Nível 32.', preEvolutionId: 363, preEvolutionName: 'Spheal', requiredLevel: 32 },
  365: { method: 'evolution', title: 'Evolução por Nível', description: 'Evolui de Sealeo ao atingir o Nível 44.', preEvolutionId: 364, preEvolutionName: 'Sealeo', requiredLevel: 44 },

  // Bagon / Salamence
  371: { method: 'wild', title: 'Encontro Raro', description: 'Encontrado no piso inferior mais profundo da Meteor Falls (área de Dragon Claw após conseguir Waterfall).' },
  372: { method: 'evolution', title: 'Evolução por Nível', description: 'Evolui de Bagon ao atingir o Nível 30.', preEvolutionId: 371, preEvolutionName: 'Bagon', requiredLevel: 30 },
  373: { method: 'evolution', title: 'Evolução por Nível', description: 'Evolui de Shelgon ao atingir o Nível 50.', preEvolutionId: 372, preEvolutionName: 'Shelgon', requiredLevel: 50 },

  // Beldum / Metagross
  374: { method: 'gift', title: 'Presente de Steven', description: 'Pokébola deixada sobre a mesa na casa de Steven Stone em Mossdeep City após vencer o Champion da Pokémon League.' },
  375: { method: 'evolution', title: 'Evolução por Nível', description: 'Evolui de Beldum ao atingir o Nível 20.', preEvolutionId: 374, preEvolutionName: 'Beldum', requiredLevel: 20 },
  376: { method: 'evolution', title: 'Evolução por Nível', description: 'Evolui de Metang ao atingir o Nível 45.', preEvolutionId: 375, preEvolutionName: 'Metang', requiredLevel: 45 },

  // Regi Trio
  377: { method: 'legendary', title: 'Ruínas do Deserto', description: 'Desert Ruins (Rota 111). A câmara se abre após decifrar o enigma em braille com Relicanth e Wailord na Sealed Chamber (Rota 134).' },
  378: { method: 'legendary', title: 'Tumba da Ilha', description: 'Island Cave (Rota 105). A câmara se abre após aguardar 2 minutos parado na parede norte da câmara selada.' },
  379: { method: 'legendary', title: 'Tumba Antiga', description: 'Ancient Tomb (Rota 120). A câmara se abre ao usar o movimento Fly no centro da sala.' },

  // Weather Trio
  382: { method: 'legendary', title: 'Lendário da Água', description: 'Marine Cave (Emerald - localização indicada pelo Weather Institute após vencer a Elite Four) ou Cave of Origin (Sapphire).' },
  383: { method: 'legendary', title: 'Lendário da Terra', description: 'Terra Cave (Emerald - localização indicada pelo Weather Institute após vencer a Elite Four) ou Cave of Origin (Ruby).' },
  384: { method: 'legendary', title: 'Guardião dos Céus', description: 'Encontro no topo do Sky Pillar (Nv. 70). Requer Mach Bike para passar pelas rachaduras do chão.' },

  // Eon Duo
  380: { method: 'legendary', title: 'Pokémon Errante (Roaming)', description: 'Em Emerald, escolha Vermelho após a Elite Four para Latias vagar pelas rotas de Hoenn. Em Sapphire, é o lendário errante padrão.' },
  381: { method: 'legendary', title: 'Pokémon Errante (Roaming)', description: 'Em Emerald, escolha Azul após a Elite Four para Latios vagar pelas rotas de Hoenn. Em Ruby, é o lendário errante padrão.' },

  // Mythicals Hoenn
  385: { method: 'gift', title: 'Pokémon Mítico', description: 'Distribuído originalmente através do Pokémon Colosseum Bonus Disc (EUA) ou Pokémon Channel (Europa).' },
  386: { method: 'gift', title: 'Pokémon Mítico', description: 'Encontro estático na Birth Island ao usar o item Aurora Ticket distribuído em eventos Nintendo.' },
}

// Métodos de obtenção específicos para a Geração 1 (Kanto RBY)
export const GEN1_SPECIFIC_MAP: Record<number, ObtainInfo> = {
  // Iniciais Kanto (Em Yellow são recebidos de NPCs)
  1: { method: 'gift', title: 'Inicial ou Presente', description: 'Em Red e Blue, escolhido no laboratório do Prof. Carvalho em Pallet. Em Pokémon Yellow, recebido de presente de uma garota em Cerulean City quando Pikachu tiver amizade alta.' },
  4: { method: 'gift', title: 'Inicial ou Presente', description: 'Em Red e Blue, escolhido no laboratório do Prof. Carvalho. Em Pokémon Yellow, presente concedido por um treinador na Rota 24 (ao norte da Nugget Bridge).' },
  7: { method: 'gift', title: 'Inicial ou Presente', description: 'Em Red e Blue, escolhido no laboratório do Prof. Carvalho. Em Pokémon Yellow, entregue pela Policial Jenny em Vermilion City após obter a Insígnia do Trovão (Lt. Surge).' },

  // Pikachu (Gen 1 não tem Pichu)
  25: { method: 'wild', title: 'Inicial ou Selvagem', description: 'Pokémon inicial em Pokémon Yellow. Em Pokémon Red e Blue, encontrado selvagem na Floresta de Viridian (taxa rara) e na Usina Elétrica (Power Plant).' },

  // Clefairy (Gen 1 não tem Cleffa)
  35: { method: 'wild', title: 'Selvagem ou Cassino', description: 'Capturado selvagem no Mt. Moon (taxa rara) ou resgatado como prêmio no Rocket Game Corner de Celadon City.' },

  // Jigglypuff (Gen 1 não tem Igglybuff)
  39: { method: 'wild', title: 'Encontro Selvagem', description: 'Encontrado selvagem na Rota 3 (Red/Blue/Yellow) e na Rota 5 (Yellow).' },

  // Trocas no Jogo (NPC Trades) Kanto
  83: { method: 'trade', title: 'Troca no Jogo (NPC Trade)', description: 'Obtido através de troca com um NPC em Vermilion City (entregue um Spearow pelo Farfetch\'d "DUX"). Em Pokémon Yellow, também pode ser capturado selvagem nas Rotas 12 e 13.' },
  108: { method: 'trade', title: 'Troca ou Safari Zone', description: 'Em Red e Blue, obtido por troca com NPC na Rota 18 (entregue um Slowbro pelo Lickitung "MARC"). Em Pokémon Yellow, capturado na Safari Zone.' },
  122: { method: 'trade', title: 'Troca no Jogo (NPC Trade)', description: 'Obtido através de troca com um NPC na Rota 2 (entregue um Abra em Red/Blue ou Clefairy em Yellow em troca do Mr. Mime "MARCEL").' },
  124: { method: 'trade', title: 'Troca no Jogo (NPC Trade)', description: 'Obtida exclusivamente por troca com um NPC em Cerulean City (entregue um Poliwhirl pela Jynx "ZYNX"). Smoochum não existe na Gen 1.' },

  // Hitmonlee e Hitmonchan (Gen 1: Dojo de Luta, Tyrogue só existe na Gen 2+)
  106: { method: 'gift', title: 'Recompensa do Dojo de Luta', description: 'Recompensa de NPC após derrotar o Mestre do Dojo de Luta em Saffron City. Escolha única entre Hitmonlee ou Hitmonchan (o outro deve ser obtido através de troca). Não evolui de Tyrogue na Gen 1.' },
  107: { method: 'gift', title: 'Recompensa do Dojo de Luta', description: 'Recompensa de NPC após derrotar o Mestre do Dojo de Luta em Saffron City. Escolha única entre Hitmonlee ou Hitmonchan (o outro deve ser obtido através de troca). Não evolui de Tyrogue na Gen 1.' },

  // Electabuzz e Magmar (Gen 1 não tem Elekid e Magby)
  125: { method: 'wild', title: 'Selvagem / Exclusivo', description: 'Capturado selvagem na Usina Elétrica (Power Plant) em Pokémon Red. Em Pokémon Blue e Yellow, deve ser obtido por troca com Pokémon Red.' },
  126: { method: 'wild', title: 'Selvagem / Exclusivo', description: 'Capturado selvagem na Mansão Pokémon de Cinnabar Island em Pokémon Blue (e Green japonês). Em Pokémon Red e Yellow, deve ser obtido por troca.' },

  // Eevee e Lapras (Gifts únicos Kanto)
  131: { method: 'gift', title: 'Presente da Silph Co.', description: 'Presente entregue por um funcionário no 7º andar do prédio da Silph Co. em Saffron City durante o resgate contra a Equipe Rocket.' },
  133: { method: 'gift', title: 'Presente da Mansão de Celadon', description: 'Obtido em uma Pokébola sobre a mesa no terraço do Celadon Condominiums em Celadon City. Único por jogo.' },

  // Fósseis Kanto
  138: { method: 'fossil', title: 'Fóssil Helix', description: 'Escolha o Helix Fossil no Mt. Moon e reviva-o no Laboratório de Cinnabar Island.' },
  140: { method: 'fossil', title: 'Fóssil Dome', description: 'Escolha o Dome Fossil no Mt. Moon e reviva-o no Laboratório de Cinnabar Island.' },
  142: { method: 'fossil', title: 'Âmbar Velho (Old Amber)', description: 'Recebido na sala secreta dos fundos do Museu de Pewter City (requer Cut) e revivido no Laboratório de Cinnabar Island.' },

  // Snorlax (Estáticos adormecidos)
  143: { method: 'legendary', title: 'Encontro Estático Adormecido', description: 'Bloqueia o caminho nas Rotas 12 e 16. Deve ser acordado utilizando a Poké Flute. Apenas 2 existem no jogo todo.' },
}

export function getPokemonObtainInfo(
  speciesId: number,
  generation?: number,
  versionName?: string,
): ObtainInfo | null {
  const isGen1 =
    generation === 1 ||
    (versionName && /red|blue|yellow|green/i.test(versionName))

  if (isGen1 && GEN1_SPECIFIC_MAP[speciesId]) {
    return GEN1_SPECIFIC_MAP[speciesId]
  }

  return OBTAIN_METHODS_MAP[speciesId] ?? null
}
