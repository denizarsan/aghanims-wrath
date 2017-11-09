const axios = require('axios');
const fs = require('fs');
const path = require('path');
const log = require('./logger');

// ********************************
//            Constants
// ********************************

// Output
const OUTPUT_DIR = './src/assets/';
const OUTPUT_FILE = 'data.json';

// Endpoints
const ENDPOINT_STRING = 'https://raw.githubusercontent.com/dotabuff/d2vpkr/master/dota/resource/dota_english.json';
const ENDPOINT_HEROES = 'https://raw.githubusercontent.com/dotabuff/d2vpkr/master/dota/scripts/npc/npc_heroes.json';
const ENDPOINT_ABILITIES = 'https://raw.githubusercontent.com/dotabuff/d2vpkr/master/dota/scripts/npc/npc_abilities.json';

// Top-level keys for heroes and abilities
const HEROES_KEY = 'DOTAHeroes';
const ABILITIES_KEY = 'DOTAAbilities';

// Constants for processing JSON responses
const HERO_PREFIX = 'npc_dota_hero_';
const ABILITY_PREFIX = 'DOTA_Tooltip_ability_';
const ABILITY_DESCRIPTION_SUFFIX = '_Description';
const ABILITY_AGHANIM_DESCRIPTION_SUFFIX = '_aghanim_description';
const ABILITY_BEHAVIOR_KEY = 'AbilityBehavior';
const ABILITY_BEHAVIOR_HIDDEN = 'DOTA_ABILITY_BEHAVIOR_HIDDEN';
const ABILITY_TYPE_KEY = 'AbilityType';
const ABILITY_TYPE_ULTIMATE = 'DOTA_ABILITY_TYPE_ULTIMATE';
const ABILITY_KEY_REGEX = /Ability([0-9]+)/;
const TARGET_DUMMY_KEY = 'npc_dota_hero_target_dummy';
const AD_DISABLED_KEY = 'AbilityDraftDisabled';
const AD_ABILITIES_KEY = 'AbilityDraftAbilities';

// Hero slugs
const GYROCOPTER = 'gyrocopter';
const NIGHT_STALKER = 'night_stalker';
const SKYWRATH_MAGE = 'skywrath_mage';
const KOTL = 'keeper_of_the_light';

// Ability slugs
const KOTL_SPIRIT_FORM_ILLUMINATE = 'keeper_of_the_light_spirit_form_illuminate';
const GENERIC_HIDDEN = 'generic_hidden';

// ********************************
//             Helpers
// ********************************

/**
 * Creates a hero object
 * @param {string} heroKey - key for the hero
 * @param {Object} strings - JSON object for strings
 * @return {Object} A new hero object with no abilities
 */
const createHero = (heroKey, strings) => {
  const slug = heroKey.replace(HERO_PREFIX, '');
  return {
    name: strings[heroKey],
    slug,
    img: `http://cdn.dota2.com/apps/dota2/images/heroes/${slug}_full.png`,
    icon: `http://cdn.dota2.com/apps/dota2/images/heroes/${slug}_icon.png`,
    abilities: [],
  };
};

/**
 * Creates an ability object
 * @param {string} abilityKey - key for the ability
 * @param {Object} strings - JSON object for strings
 * @return {Object} A new ability object
 */
const createAbility = (abilityKey, heroKey, strings) => {
  const orginalAbilityKey = ABILITY_PREFIX + abilityKey;
  return {
    name: strings[orginalAbilityKey],
    desc: strings[orginalAbilityKey + ABILITY_DESCRIPTION_SUFFIX],
    img: `http://cdn.dota2.com/apps/dota2/images/abilities/${abilityKey}_md.png`,
    slug: abilityKey,
    hero: strings[HERO_PREFIX + heroKey],
    aghs: strings[orginalAbilityKey + ABILITY_AGHANIM_DESCRIPTION_SUFFIX],
  };
};

// ********************************
//            Resources
// ********************************

/**
 * Makes a call to ENDPOINT_STRING and returns the results
 * @return {Object} JSON object for strings
 */
const getStrings = () => {
  const url = ENDPOINT_STRING;
  const config = {};

  return axios.get(url, config);
};

/**
 * Makes a call to ENDPOINT_HEROES, formats and returns the results
 * @param {Object} strings - JSON object for strings
 * @return {Object} Formatted JSON object for heroes combined with strings
 */
const getHeroes = (strings) => {
  const url = ENDPOINT_HEROES;
  const config = {
    transformResponse: axios.defaults.transformResponse.concat((response) => {
      const data = response[HEROES_KEY];
      const heroes = {};

      Object.keys(data)
        .filter(key => key.includes(HERO_PREFIX))
        .filter(key => key !== TARGET_DUMMY_KEY)
        .filter(key => !Object.hasOwnProperty.call(data[key], AD_DISABLED_KEY))
        .forEach((heroKey) => {
          const newHeroKey = heroKey.replace(HERO_PREFIX, '');
          heroes[newHeroKey] = createHero(heroKey, strings);

          if (data[heroKey][AD_ABILITIES_KEY]) {
            Object.values(data[heroKey][AD_ABILITIES_KEY]).forEach((abilityKey) => {
              heroes[newHeroKey].abilities.push(createAbility(abilityKey, newHeroKey, strings));
            });
          } else {
            Object.keys(data[heroKey]).forEach((key) => {
              const abilityMatch = key.match(ABILITY_KEY_REGEX);
              if (abilityMatch
                && parseInt(abilityMatch[1], 10) < 10
                && data[heroKey][key] !== GENERIC_HIDDEN) {
                const newAbility = createAbility(data[heroKey][key], newHeroKey, strings);
                heroes[newHeroKey].abilities.push(newAbility);
              }
            });
          }
        });

      return heroes;
    }),
  };

  return axios.get(url, config);
};

/**
 * Makes a call to ENDPOINT_ABILITIES, formats and returns the results
 * @param {Object} heroes - JSON object for heroes
 * @return {Object} Augmented and filtered JSON object for heroes
 */
const addAbilityMetadata = (heroes) => {
  const url = ENDPOINT_ABILITIES;
  const config = {
    transformResponse: axios.defaults.transformResponse.concat((response) => {
      const data = response[ABILITIES_KEY];
      const newHeroes = JSON.parse(JSON.stringify(heroes));

      Object.keys(newHeroes).forEach((hero) => {
        newHeroes[hero].abilities =
          newHeroes[hero].abilities
            .filter(ability =>
              !data[ability.slug][ABILITY_BEHAVIOR_KEY].includes(ABILITY_BEHAVIOR_HIDDEN))
            .map((ability) => {
              const ultObj = {
                isUltimate: data[ability.slug][ABILITY_TYPE_KEY] === ABILITY_TYPE_ULTIMATE,
              };
              return Object.assign(ability, ultObj);
            });
      });

      return newHeroes;
    }),
  };

  return axios.get(url, config);
};

/**
 * Updates the data in './src/assets/data.json'
 */
const updateData = () => {
  log.wait('Updating data...', 'data');
  getStrings().then((stringsResponse) => {
    const strings = stringsResponse.data.lang.Tokens;

    getHeroes(strings).then((heroesResponse) => {
      const heroes = heroesResponse.data;

      addAbilityMetadata(heroes).then((abilityMetadataResponse) => {
        const data = abilityMetadataResponse.data;

        // Add Skywrath Mage's missing Aghanim upgrade descriptions
        data[SKYWRATH_MAGE].abilities[0].aghs = data[SKYWRATH_MAGE].abilities[3].aghs;
        data[SKYWRATH_MAGE].abilities[1].aghs = data[SKYWRATH_MAGE].abilities[3].aghs;
        data[SKYWRATH_MAGE].abilities[2].aghs = data[SKYWRATH_MAGE].abilities[3].aghs;

        // Add Keeper of the Light's missing Illuminate Aghanim upgrade description
        data[KOTL].abilities[0].aghs =
          strings[ABILITY_PREFIX +
            KOTL_SPIRIT_FORM_ILLUMINATE +
            ABILITY_AGHANIM_DESCRIPTION_SUFFIX];

        // Remove hero bound Aghanim upgrade decsriptions
        delete data[GYROCOPTER].abilities[3].aghs;
        delete data[NIGHT_STALKER].abilities[3].aghs;

        if (!fs.existsSync(OUTPUT_DIR)) {
          fs.mkdirSync(OUTPUT_DIR);
          log.info(`Created directory ${OUTPUT_DIR}`);
        }

        fs.writeFileSync(path.join(OUTPUT_DIR, OUTPUT_FILE), JSON.stringify(data, null, 2));
        log.done('Updated data successfully', 'data');
      });
    });
  });
};

updateData();
