const axios = require('axios');
const fs = require('fs');

const abilitiesToRemove = [
  { hero: 'gyrocopter', slug: 'gyrocopter_call_down' },
  { hero: 'keeper_of_the_light', slug: 'keeper_of_the_light_illuminate' },
  { hero: 'night_stalker', slug: 'night_stalker_darkness' },
];

const missingSkywrathAbilities = [
  'skywrath_mage_arcane_bolt',
  'skywrath_mage_concussive_shot',
  'skywrath_mage_ancient_seal',
];

const getHeroes = () => {
  const url = 'https://api.opendota.com/api/heroes';
  const config = {
    transformResponse: axios.defaults.transformResponse.concat((response) => {
      const heroes = {};

      response.forEach((hero) => {
        const key = hero.name.replace('npc_dota_hero_', '');
        heroes[key] = {
          name: hero.localized_name,
          slug: key,
          img: `http://cdn.dota2.com/apps/dota2/images/heroes/${key}_full.png`,
          icon: `http://cdn.dota2.com/apps/dota2/images/heroes/${key}_icon.png`,
        };
      });
      fs.writeFileSync('./src/assets/tmp/heroes.json', JSON.stringify(heroes, null, 2));
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
        .filter(key => !key.includes('special'))
        .forEach((key) => {
          abilities[key] = {
            name: response[key].dname,
            description: response[key].desc,
            img: `http://cdn.dota2.com/apps/dota2/images/abilities/${key}_md.png`,
            slug: key,
          };
        });
      fs.writeFileSync('./src/assets/tmp/abilities.json', JSON.stringify(abilities, null, 2));
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
        const newKey = key.replace('npc_dota_hero_', '');
        response[newKey] = {};
        response[newKey].abilities = response[key].abilities;
        delete response[key];
      });
      fs.writeFileSync('./src/assets/tmp/hero-abilities.json', JSON.stringify(response, null, 2));
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
        .filter(key => key.includes('aghanim_description'))
        .forEach((key) => {
          const newKey = key.replace('DOTA_Tooltip_ability_', '').replace('_aghanim_description', '');
          abilities[newKey] = data[key];
        });
      fs.writeFileSync('./src/assets/tmp/aghs.json', JSON.stringify(abilities, null, 2));
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
        .filter(key => hasOwnProperty.call(data[key], 'AbilityDraftAbilities'))
        .forEach((key) => {
          const newKey = key.replace('npc_dota_hero_', '');
          adHeroAbilities[newKey] = {};
          adHeroAbilities[newKey].abilities = Object.values(data[key]['AbilityDraftAbilities']);
        });

      Object.keys(data)
        .filter(key => hasOwnProperty.call(data[key], 'AbilityDraftUniqueAbilities'))
        .forEach((key) => {
          const newKey = key.replace('npc_dota_hero_', '');
          adUniqueHeroAbilities[newKey] = {};
          adUniqueHeroAbilities[newKey].uniques = Object.values(data[key]['AbilityDraftUniqueAbilities']);
        });

      Object.keys(data)
        .filter(key => data[key]['AbilityDraftDisabled'] === '1')
        .forEach((key) => {
          unavailableHeroes.push(key.replace('npc_dota_hero_', ''));
        });
      fs.writeFileSync('./src/assets/tmp/ad-hero-abilities.json', JSON.stringify(adHeroAbilities, null, 2));
      return { adHeroAbilities, adUniqueHeroAbilities, unavailableHeroes };
    }),
  };

  return axios.get(url, config);
};


axios.all([getHeroes(), getAbilities(), getHeroAbilities(), getAghsAbilityDescriptions(), getADData()])
  .then(axios.spread((heroesResponse, abilitiesResponse, heroAbilitiesResponse, aghsAbilityDescriptionsResponse, adDataResponse) => {
    // Get response data
    const heroes = heroesResponse.data;
    const abilities = abilitiesResponse.data;
    const heroAbilities = heroAbilitiesResponse.data;
    const aghsAbilityDescriptions = aghsAbilityDescriptionsResponse.data;
    const adHeroAbilities = adDataResponse.data.adHeroAbilities;
    const adUniqueHeroAbilities = adDataResponse.data.adUniqueHeroAbilities;
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
      if (abilities[key].description && abilities[key].description.includes('Aghanim\'s Scepter')) {
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
      aghsHeroAbilities['skywrath_mage'].abilities.push(ability);
      aghsAbilities[ability] = abilities[ability];
      aghsAbilityDescriptions[ability] = aghsAbilityDescriptions['skywrath_mage_mystic_flare'];
    });

    // Remove abilities to remove
    abilitiesToRemove.forEach((ability) => {
      aghsHeroAbilities[ability.hero].abilities.splice(aghsHeroAbilities[ability.hero].abilities.indexOf(ability.slug), 1);
      delete aghsAbilities[ability.slug];
      delete aghsAbilityDescriptions[ability.slug];
    });

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
  ),
);
