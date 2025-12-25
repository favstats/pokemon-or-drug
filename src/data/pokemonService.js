// Pokemon API Service
// Fetches Pokemon data from PokeAPI

const POKEAPI_BASE = 'https://pokeapi.co/api/v2';

// Cache to reduce API calls
const pokemonCache = new Map();

// Get detailed Pokemon data including sprite
export const fetchPokemonDetails = async (nameOrId) => {
  // Normalize the name for the API
  let apiName = String(nameOrId).toLowerCase().replace(/ /g, '-');
  
  // Handle special Pokemon forms that need different API names
  const specialForms = {
    'deoxys': 'deoxys-normal',
    'wormadam': 'wormadam-plant',
    'giratina': 'giratina-altered',
    'shaymin': 'shaymin-land',
    'basculin': 'basculin-red-striped',
    'darmanitan': 'darmanitan-standard',
    'tornadus': 'tornadus-incarnate',
    'thundurus': 'thundurus-incarnate',
    'landorus': 'landorus-incarnate',
    'keldeo': 'keldeo-ordinary',
    'meloetta': 'meloetta-aria',
    'meowstic': 'meowstic-male',
    'aegislash': 'aegislash-shield',
    'pumpkaboo': 'pumpkaboo-average',
    'gourgeist': 'gourgeist-average',
    'zygarde': 'zygarde-50',
    'oricorio': 'oricorio-baile',
    'lycanroc': 'lycanroc-midday',
    'wishiwashi': 'wishiwashi-solo',
    'minior': 'minior-red-meteor',
    'mimikyu': 'mimikyu-disguised',
    'toxtricity': 'toxtricity-amped',
    'eiscue': 'eiscue-ice',
    'indeedee': 'indeedee-male',
    'morpeko': 'morpeko-full-belly',
    'urshifu': 'urshifu-single-strike',
  };
  
  if (specialForms[apiName]) {
    apiName = specialForms[apiName];
  }
  
  // Check cache first
  if (pokemonCache.has(apiName)) {
    return pokemonCache.get(apiName);
  }
  
  try {
    const response = await fetch(`${POKEAPI_BASE}/pokemon/${apiName}`);
    
    if (!response.ok) {
      console.warn(`Pokemon ${apiName} not found, using fallback`);
      return null;
    }
    
    const data = await response.json();
    
    const pokemonData = {
      id: data.id,
      name: formatPokemonName(data.name),
      sprite: data.sprites.other['official-artwork'].front_default || 
              data.sprites.front_default,
      types: data.types.map(t => t.type.name),
    };
    
    pokemonCache.set(apiName, pokemonData);
    return pokemonData;
  } catch (error) {
    console.warn(`Error fetching Pokemon ${apiName}:`, error.message);
    return null;
  }
};

// Format Pokemon name for display (capitalize, handle special chars)
const formatPokemonName = (name) => {
  return name
    .split('-')[0] // Take first part only for display
    .charAt(0).toUpperCase() + name.split('-')[0].slice(1);
};

// Curated list of Pokemon with API-compatible names
// These are Pokemon that work well for the guessing game
export const trickyPokemonNames = [
  'Abra', 'Absol', 'Alakazam', 'Arceus', 'Articuno',
  'Beldum', 'Bronzor', 'Celebi', 'Chimecho', 'Cresselia',
  'Darkrai', 'Dialga', 'Diancie', 'Dratini', 'Drowzee',
  'Espeon', 'Gallade', 'Gardevoir', 'Glalie', 'Gothitelle',
  'Groudon', 'Haxorus', 'Hoopa', 'Hydreigon', 'Hypno',
  'Jirachi', 'Kyogre', 'Kyurem', 'Latias', 'Latios',
  'Lugia', 'Lunala', 'Magearna', 'Malamar', 'Manaphy',
  'Marshadow', 'Metagross', 'Mew', 'Mewtwo', 'Milotic',
  'Naganadel', 'Necrozma', 'Nihilego', 'Ninjask', 'Noivern',
  'Palkia', 'Pheromosa', 'Porygon', 'Ralts', 'Rayquaza',
  'Regice', 'Regigigas', 'Registeel', 'Reshiram', 'Sableye',
  'Salamence', 'Silvally', 'Solgaleo', 'Stakataka', 'Suicune',
  'Sylveon', 'Terrakion', 'Toxapex', 'Umbreon', 'Uxie',
  'Victini', 'Virizion', 'Volcarona', 'Xerneas', 'Yveltal',
  'Zacian', 'Zamazenta', 'Zekrom', 'Zeraora', 'Zoroark',
  'Gengar', 'Haunter', 'Lucario', 'Riolu', 'Scizor',
  'Tyranitar', 'Dragonite', 'Eevee', 'Pikachu', 'Charizard',
  'Blastoise', 'Venusaur', 'Machamp', 'Alakazam', 'Gyarados'
];

export default {
  fetchPokemonDetails,
  trickyPokemonNames
};
