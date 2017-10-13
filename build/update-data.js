const request = require('request');
const async = require('async');
const fs = require('fs');

const sources = [
  {
    name: 'abilities',
    url: 'https://raw.githubusercontent.com/odota/dotaconstants/master/build/abilities.json',
    transform: response => {
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
    },
  },
  {
    name: 'heroes',
    url: 'https://api.opendota.com/api/heroes',
    transform: response => {
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
    },
  },
  {
    name: 'hero_abilities',
    url: 'https://raw.githubusercontent.com/odota/dotaconstants/master/build/hero_abilities.json',
    transform: response => {
      Object.keys(response).forEach(key => {
        const newKey = key.replace('npc_dota_hero_', '');
        response[newKey] = {}
        response[newKey].abilities = response[key].abilities;
        delete response[key];
      })

      return response;
    }
  },
];

async.each(sources,
  (source, callback) => {
    console.log(source.url);
    request(source.url, (error, response, body) => {
      if (error || response.statusCode !== 200) {
        return callback(error);
      }
      body = JSON.parse(body);
      if (source.transform) {
        body = source.transform(body);
      }
      fs.writeFileSync('./src/assets/' + source.name + '.json', JSON.stringify(body, null, 2));
      callback(error);
    });
  },
  (error) => {
    if (error) {
      throw error;
    }
  }
);
