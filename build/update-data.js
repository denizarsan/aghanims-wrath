const axios = require('axios');
const fs = require('fs');

// ****************************************
//                Constants
// ****************************************

// Keys
const AD_ABILITIES_KEY = 'AbilityDraftAbilities';
const AD_DISABLED_KEY = 'AbilityDraftDisabled';
const AD_UNIQ_ABILITIES_KEY = 'AbilityDraftUniqueAbilities';
const AGHS_ABILITY_PREFIX = 'DOTA_Tooltip_ability_';
const AGHS_ABILITY_SUFFIX = '_aghanim_description';
const HERO_PREFIX = 'npc_dota_hero_';
const TALENT_KEY = 'special';

// Items
const AGHANIMS_SCEPTER = 'Aghanim\'s Scepter';

// Heroes
const GYROCOPTER = 'gyrocopter';
const NIGHT_STALKER = 'night_stalker';
const SKYWRATH = 'skywrath_mage';

// Abilities
const ANCIENT_SEAL = 'skywrath_mage_ancient_seal';
const ARCANE_BOLT = 'skywrath_mage_arcane_bolt';
const CALL_DOWN = 'gyrocopter_call_down';
const CONCUSSIVE_SHOT = 'skywrath_mage_concussive_shot';
const DARKNESS = 'night_stalker_darkness';
const ILLUMINATE = 'keeper_of_the_light_illuminate';
const ILLUMINATE_SF = 'keeper_of_the_light_spirit_form_illuminate';
const MYSTIC_FLARE = 'skywrath_mage_mystic_flare';

const abilitiesToRemove = [
  { hero: GYROCOPTER, slug: CALL_DOWN },
  { hero: NIGHT_STALKER, slug: DARKNESS },
];

const missingSkywrathAbilities = [
  ARCANE_BOLT,
  CONCUSSIVE_SHOT,
  ANCIENT_SEAL,
];


// ****************************************
//                Resources
// ****************************************
const getHeroes = () => {
  const url = 'https://api.opendota.com/api/heroes';
  const config = {
    transformResponse: axios.defaults.transformResponse.concat((response) => {
      const heroes = {};

      response.forEach((hero) => {
        const key = hero.name.replace(HERO_PREFIX, '');
        heroes[key] = {
          name: hero.localized_name,
          slug: key,
          img: `http://cdn.dota2.com/apps/dota2/images/heroes/${key}_full.png`,
          icon: `http://cdn.dota2.com/apps/dota2/images/heroes/${key}_icon.png`,
        };
      });

      return heroes;
    }),
  };

  return axios.get(url, config);
};

const getAbilities = () => {
  const url = 'https://raw.githubusercontent.com/odota/dotaconstants/master/build/abilities.json';
  const config = {
    transformResponse: axios.defaults.transformResponse.concat((response) => {
      const abilities = {};

      Object.keys(response)
        .filter(key => !key.includes(TALENT_KEY))
        .forEach((key) => {
          abilities[key] = {
            name: response[key].dname,
            description: response[key].desc,
            img: `http://cdn.dota2.com/apps/dota2/images/abilities/${key}_md.png`,
            slug: key,
          };
        });

      return abilities;
    }),
  };

  return axios.get(url, config);
};

const getHeroAbilities = () => {
  const url = 'https://raw.githubusercontent.com/odota/dotaconstants/master/build/hero_abilities.json';
  const config = {
    transformResponse: axios.defaults.transformResponse.concat((response) => {
      Object.keys(response).forEach((key) => {
        const newKey = key.replace(HERO_PREFIX, '');
        response[newKey] = {};
        response[newKey].abilities = response[key].abilities;
        delete response[key];
      });

      return response;
    }),
  };

  return axios.get(url, config);
};

const getAghsAbilityDescriptions = () => {
  const url = 'https://raw.githubusercontent.com/dotabuff/d2vpkr/master/dota/resource/dota_english.json';
  const config = {
    transformResponse: axios.defaults.transformResponse.concat((response) => {
      const data = response.lang.Tokens;
      const abilities = {};

      Object.keys(data)
        .filter(key => key.includes(AGHS_ABILITY_SUFFIX))
        .forEach((key) => {
          const newKey = key.replace(AGHS_ABILITY_PREFIX, '').replace(AGHS_ABILITY_SUFFIX, '');
          abilities[newKey] = data[key];
        });

      return abilities;
    }),
  };

  return axios.get(url, config);
};

const getADData = () => {
  const url = 'https://raw.githubusercontent.com/dotabuff/d2vpkr/master/dota/scripts/npc/npc_heroes.json';
  const config = {
    transformResponse: axios.defaults.transformResponse.concat((response) => {
      const data = response.DOTAHeroes;
      const adHeroAbilities = {};
      const adUniqueHeroAbilities = {};
      const unavailableHeroes = [];

      Object.keys(data)
        .filter(key => hasOwnProperty.call(data[key], AD_ABILITIES_KEY))
        .forEach((key) => {
          const newKey = key.replace(HERO_PREFIX, '');
          adHeroAbilities[newKey] = {};
          adHeroAbilities[newKey].abilities = Object.values(data[key][AD_ABILITIES_KEY]);
        });

      Object.keys(data)
        .filter(key => hasOwnProperty.call(data[key], AD_UNIQ_ABILITIES_KEY))
        .forEach((key) => {
          const newKey = key.replace(HERO_PREFIX, '');
          adUniqueHeroAbilities[newKey] = {};
          adUniqueHeroAbilities[newKey].uniques = Object.values(data[key][AD_UNIQ_ABILITIES_KEY]);
        });

      Object.keys(data)
        .filter(key => data[key][AD_DISABLED_KEY] === '1')
        .forEach((key) => {
          unavailableHeroes.push(key.replace(HERO_PREFIX, ''));
        });

      return {
        adHeroAbilities,
        // adUniqueHeroAbilities,
        unavailableHeroes };
    }),
  };

  return axios.get(url, config);
};

const resources = [
  getHeroes(),
  getAbilities(),
  getHeroAbilities(),
  getAghsAbilityDescriptions(),
  getADData(),
];

// ****************************************
//                Processing
// ****************************************
axios.all(resources)
  .then(axios.spread((
    heroesResponse,
    abilitiesResponse,
    heroAbilitiesResponse,
    aghsAbilityDescriptionsResponse,
    adDataResponse) => {
    // Get response data
    const heroes = heroesResponse.data;
    const abilities = abilitiesResponse.data;
    const heroAbilities = heroAbilitiesResponse.data;
    const aghsAbilityDescriptions = aghsAbilityDescriptionsResponse.data;
    const adHeroAbilities = adDataResponse.data.adHeroAbilities;
    // const adUniqueHeroAbilities = adDataResponse.data.adUniqueHeroAbilities;
    const unavailableHeroes = adDataResponse.data.unavailableHeroes;

    // Initialize intermediate data to be constructed from response data
    const availableHeros = {};
    const aghsAbilities = {};
    const aghsHeroAbilities = {};

    // Need only available heroes
    Object.keys(heroes).forEach((key) => {
      if (!unavailableHeroes.includes(key)) {
        availableHeros[key] = heroes[key];
      }
    });

    // Need only upgradable abilities
    Object.keys(abilities).forEach((key) => {
      if (abilities[key].description && abilities[key].description.includes(AGHANIMS_SCEPTER)) {
        aghsAbilities[key] = abilities[key];
      }
    });

    // Need ability draft specific ability lists
    Object.keys(adHeroAbilities).forEach((key) => {
      heroAbilities[key].abilities = adHeroAbilities[key].abilities;
    });

    // Need only available heroes and upgradable abilities
    Object.keys(heroAbilities).forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(availableHeros, key)) {
        const filteredAbilities = heroAbilities[key].abilities
          .filter(ability => Object.prototype.hasOwnProperty.call(aghsAbilities, ability));
        aghsHeroAbilities[key] = { abilities: filteredAbilities };
      }
    });

    // Add Skywrath Mage's missing abilities
    missingSkywrathAbilities.forEach((ability) => {
      aghsHeroAbilities[SKYWRATH].abilities.push(ability);
      aghsAbilities[ability] = abilities[ability];
      aghsAbilityDescriptions[ability] = aghsAbilityDescriptions[MYSTIC_FLARE];
    });

    // Remove abilities to remove
    abilitiesToRemove.forEach((ability) => {
      aghsHeroAbilities[ability.hero].abilities
        .splice(aghsHeroAbilities[ability.hero].abilities.indexOf(ability.slug), 1);
      delete aghsAbilities[ability.slug];
      delete aghsAbilityDescriptions[ability.slug];
    });

    // Replace kotl spirit form illuminate with regular illuminate
    aghsAbilityDescriptions[ILLUMINATE] = aghsAbilityDescriptions[ILLUMINATE_SF];
    delete aghsAbilityDescriptions[ILLUMINATE_SF];

    // Initialize resulting data
    const data = {};

    // Go through each available hero and populate their abilities
    Object.keys(availableHeros).forEach((key) => {
      data[key] = Object.assign(availableHeros[key], aghsHeroAbilities[key]);
      data[key].abilities = data[key].abilities.map(ability =>
        Object.assign(aghsAbilities[ability], {
          hero: availableHeros[key].name,
          aghs: aghsAbilityDescriptions[ability],
        }));
    });

    // Write data to file
    fs.writeFileSync('./src/assets/data.json', JSON.stringify(data, null, 2));
  },
  ));
