const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Output
const OUTPUT_DIR = './src/assets/';
const OUTPUT_FILE = 'data.json';

// Endpoints
const ENDPOINT_STRING = 'https://raw.githubusercontent.com/dotabuff/d2vpkr/master/dota/resource/localization/dota_english.json';
const ENDPOINT_HEROES = 'https://raw.githubusercontent.com/dotabuff/d2vpkr/master/dota/scripts/npc/npc_heroes.json';
const ENDPOINT_ABILITIES = 'https://raw.githubusercontent.com/dotabuff/d2vpkr/master/dota/resource/localization/abilities_english.json';


const HEROES_KEY = 'DOTAHeroes';
const HERO_PREFIX = 'npc_dota_hero_';
const ABILITY_PREFIX = 'DOTA_Tooltip_ability_';
const ABILITY_DESCRIPTION_SUFFIX = '_Description';
const ABILITY_AGHANIM_DESCRIPTION_SUFFIX = '_aghanim_description';
const ABILITY_KEY_REGEX = /Ability([0-9]+)/;
const TARGET_DUMMY_KEY = 'npc_dota_hero_target_dummy';
const BASE_HERO_KEY = 'npc_dota_hero_base';
const AD_DISABLED_KEY = 'AbilityDraftDisabled';
const AD_ABILITIES_KEY = 'AbilityDraftAbilities';
const GENERIC_HIDDEN = 'generic_hidden';


const getStrings = () => axios.get(ENDPOINT_STRING).then(r => r.data.lang.Tokens)
const getHeroes = () => axios.get(ENDPOINT_HEROES).then(r => r.data[HEROES_KEY]);
const getAbilities = () => axios.get(ENDPOINT_ABILITIES).then(r => r.data.lang.Tokens);

const createHero = (key, heroes, strings, abilities) => {
  const newKey = key.replace(HERO_PREFIX, '');
  const hero = {
    name: strings[key],
    hero: newKey,
    img: `http://cdn.dota2.com/apps/dota2/images/heroes/${newKey}_full.png`,
    icon: `http://cdn.dota2.com/apps/dota2/images/heroes/${newKey}_icon.png`,
    src: `/images/${newKey}_icon.png`,
    abilities: [],
  };

  if (heroes[key][AD_ABILITIES_KEY]) {
    Object.keys(heroes[key][AD_ABILITIES_KEY]).forEach((abilityKey) => {
      hero.abilities.push(createAbility(heroes[key][AD_ABILITIES_KEY][abilityKey], newKey, abilities, abilityKey));
    });
  } else {
    Object.keys(heroes[key]).forEach((abilityKey) => {
      const abilityMatch = abilityKey.match(ABILITY_KEY_REGEX);
      if (abilityMatch
        && parseInt(abilityMatch[1], 10) < 10
        && heroes[key][abilityKey] !== GENERIC_HIDDEN) {
        const newAbility = createAbility(heroes[key][abilityKey], newKey, abilities, abilityKey);
        hero.abilities.push(newAbility);
      }
    });
  }
  return hero;
};

const createAbility = (abilitySlug, heroKey, strings, abilityKey) => {
  const orginalAbilitySlug = ABILITY_PREFIX + abilitySlug;
  return {
    name: strings[orginalAbilitySlug],
    desc: strings[orginalAbilitySlug + ABILITY_DESCRIPTION_SUFFIX],
    img: `http://cdn.dota2.com/apps/dota2/images/abilities/${abilitySlug}_md.png`,
    src: `/images/${abilitySlug}_md.png`,
    slug: abilitySlug,
    hero: heroKey,
    aghs: strings[orginalAbilitySlug + ABILITY_AGHANIM_DESCRIPTION_SUFFIX],
    isUltimate: abilityKey === 'Ability6',
  };
};

const update = async () => {
  const strings = await getStrings();
  const heroes = await getHeroes();
  const abilities = await getAbilities();

  const data = Object.keys(heroes)
    .filter(key => key.includes(HERO_PREFIX))
    .filter(key => key !== TARGET_DUMMY_KEY && key !== BASE_HERO_KEY)
    .filter(key => !(Object.hasOwnProperty.call(heroes[key], AD_DISABLED_KEY) && heroes[key][AD_DISABLED_KEY] === '1'))
    .reduce((acc, curr) => {
      const newKey = curr.replace(HERO_PREFIX, '');
      acc[newKey] = createHero(curr, heroes, strings, abilities);
      return acc;
    }, {})

  // Remove unavailable abilities
  data['tiny'].abilities.splice(3, 1);
  data['tiny'].abilities.splice(4, 1);
  data['bane'].abilities.splice(4, 1);
  data['kunkka'].abilities.splice(4, 1);
  data['ancient_apparition'].abilities.splice(4, 1);
  data['alchemist'].abilities.splice(4, 1);
  data['naga_siren'].abilities.splice(4, 1);
  data['wisp'].abilities.splice(4, 2);
  data['visage'].abilities.splice(3, 1);
  data['abyssal_underlord'].abilities.splice(4, 1);
  data['pangolier'].abilities.splice(4, 1);
  data['grimstroke'].abilities.splice(3, 1);

  // Remove unavailable aghs updates
  delete data['tiny'].abilities[3].aghs;
  delete data['zuus'].abilities[3].aghs;
  delete data['spectre'].abilities[3].aghs;
  delete data['gyrocopter'].abilities[2].aghs;
  delete data['alchemist'].abilities[3].aghs;
  delete data['treant'].abilities[3].aghs;

  // Ultimate corrections
  data['puck'].abilities[2].isUltimate = true;
  data['shredder'].abilities[3].isUltimate = true;
  data['zuus'].abilities[3].isUltimate = true;
  data['beastmaster'].abilities[3].isUltimate = true;
  data['templar_assassin'].abilities[3].isUltimate = true;
  data['chen'].abilities[3].isUltimate = true;
  data['spectre'].abilities[3].isUltimate = true;
  data['doom_bringer'].abilities[2].isUltimate = true;
  data['ursa'].abilities[3].isUltimate = true;
  data['gyrocopter'].abilities[3].isUltimate = true;
  data['shadow_demon'].abilities[2].isUltimate = true;
  data['treant'].abilities[3].isUltimate = true;
  data['nyx_assassin'].abilities[3].isUltimate = true;
  data['keeper_of_the_light'].abilities[3].isUltimate = true;
  data['troll_warlord'].abilities[1].isUltimate = true;
  data['tusk'].abilities[3].isUltimate = true;
  data['elder_titan'].abilities[2].isUltimate = true;
  data['ember_spirit'].abilities[3].isUltimate = true;
  data['terrorblade'].abilities[2].isUltimate = true;
  data['phoenix'].abilities[2].isUltimate = true;
  data['techies'].abilities[3].isUltimate = true;
  data['monkey_king'].abilities[3].isUltimate = true;
  data['dark_willow'].abilities[3].isUltimate = true;

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR);
  }

  fs.writeFileSync(path.join(OUTPUT_DIR, OUTPUT_FILE), JSON.stringify(data, null, 2));
}

update();
