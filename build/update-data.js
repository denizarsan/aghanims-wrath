const axios = require('axios');
const fs = require('fs');

const unavailableHeroes = [
  'Beastmaster',
  'Chen',
  'Doom',
  'Earth Spirit',
  'Ember Spirit',
  'Invoker',
  'Io',
  'Keeper of the Light',
  'Lone Druid',
  'Meepo',
  'Monkey King',
  'Morphling',
  'Ogre Magi',
  'Phoenix',
  'Puck',
  'Rubick',
  'Shadow Fiend',
  'Shadow Demon',
  'Spectre',
  'Techies',
  'Templar Assassin',
  'Timbersaw',
  'Troll Warlord',
  'Tusk',
  'Vengeful Spirit',
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

      Object.keys(response).filter(key => !key.includes('special')).forEach((key) => {
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
        const newKey = key.replace('npc_dota_hero_', '');
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

      Object.keys(data).filter(key => key.includes('aghanim_description')).forEach((key) => {
        const newKey = key.replace('DOTA_Tooltip_ability_', '').replace('_aghanim_description', '');
        abilities[newKey] = data[key];
      });

      return abilities;
    }),
  };

  return axios.get(url, config);
};

axios.all([getHeroes(), getAbilities(), getHeroAbilities(), getAghsAbilityDescriptions()])
  .then(axios.spread(
    (heroesResponse, abilitiesResponse, heroAbilitiesResponse, aghsAbilityDescriptionsResponse) => {
      // Get response data
      const heroes = heroesResponse.data;
      const abilities = abilitiesResponse.data;
      const heroAbilities = heroAbilitiesResponse.data;
      const aghsAbilityDescriptions = aghsAbilityDescriptionsResponse.data;

      // Initialize intermediate data to be constructed from response data
      const availableHeros = {};
      const aghsAbilities = {};
      const aghsHeroAbilities = {};

      // Need only available heroes
      Object.keys(heroes).forEach((key) => {
        if (!unavailableHeroes.includes(heroes[key].name)) {
          availableHeros[key] = heroes[key];
        }
      });

      // Need only upgradable abilities
      Object.keys(abilities).forEach((key) => {
        if (abilities[key].description && abilities[key].description.includes('Aghanim\'s Scepter')) {
          aghsAbilities[key] = abilities[key];
        }
      });

      // Need only available heroes and upgradable abilities
      Object.keys(heroAbilities).forEach((key) => {
        if (Object.prototype.hasOwnProperty.call(availableHeros, key)) {
          const filteredAbilities = heroAbilities[key].abilities
            .filter(ability => Object.prototype.hasOwnProperty.call(aghsAbilities, ability));

          aghsHeroAbilities[key] = { abilities: filteredAbilities };
        }
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
