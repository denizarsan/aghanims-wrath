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
  'Vengeful Spirit'
];

const getHeroes = () => {
  const url = 'https://api.opendota.com/api/heroes';
  const config = {
    transformResponse: axios.defaults.transformResponse.concat(response => {
      const heroes = {};

      const heroComparator = (a, b) => {
        if (a.name > b.name) { return 1; }
        if (a.name < b.name) { return -1; }
        return 0;
      };

      response.forEach((hero) => {
        const key = hero.name.replace('npc_dota_hero_', '');
        heroes[key] = {
          name: hero.localized_name,
          slug: key,
          img: 'http://cdn.dota2.com/apps/dota2/images/heroes/' + key + '_full.png',
          icon: 'http://cdn.dota2.com/apps/dota2/images/heroes/' + key + '_icon.png'
        }
      });

      return heroes;
    })
  };

  return axios.get(url, config);
};

const getAbilities = () => {
  const url = 'https://raw.githubusercontent.com/odota/dotaconstants/master/build/abilities.json';
  const config = {
    transformResponse: axios.defaults.transformResponse.concat(response => {
      const abilities = {};

      Object.keys(response).filter(key => !key.includes('special')).forEach((key) => {
        abilities[key] = {
          name: response[key].dname,
          description: response[key].desc,
          img: 'http://cdn.dota2.com/apps/dota2/images/abilities/' + key + '_md.png',
          slug: key
        }
      });

      return abilities;
    })
  };

  return axios.get(url, config);
};

const getHeroAbilities = () => {
  const url = 'https://raw.githubusercontent.com/odota/dotaconstants/master/build/hero_abilities.json';
  const config = {
    transformResponse: axios.defaults.transformResponse.concat(response => {
      Object.keys(response).forEach(key => {
        const newKey = key.replace('npc_dota_hero_', '');
        response[newKey] = {}
        response[newKey].abilities = response[key].abilities;
        delete response[key];
      })

      return response;
    })
  };

  return axios.get(url, config);
};

axios.all([getHeroes(), getAbilities(), getHeroAbilities()])
  .then(axios.spread((heroesResponse, abilitiesResponse, heroAbilitiesResponse) => {

    // Get response data
    const heroes = heroesResponse.data;
    const abilities = abilitiesResponse.data;
    const heroAbilities = heroAbilitiesResponse.data;

    // Initialize resulting data
    const data = {};

    // Go through each available hero and populate their abilities
    Object.keys(heroes).forEach((key) => {
      if (!unavailableHeroes.includes(heroes[key].name)) {
        data[key] = Object.assign(heroes[key], heroAbilities[key]);
        data[key].abilities = data[key].abilities.map(ability =>
          Object.assign(abilities[ability], { hero: heroes[key].name }));
      }
    });

    // Write data to file
    fs.writeFileSync('./src/assets/data.json', JSON.stringify(data, null, 2));
  })
);
