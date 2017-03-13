const request = require('request');
const async = require('async');
const fs = require('fs');

const unavailableHeroes = [
  'Beastmaster','Chen','Doom','Earth Spirit','Ember Spirit',
  'Invoker','Io','Keeper of the Light','Lone Druid','Meepo',
  'Monkey King','Morphling','Ogre Magi','Phoenix','Puck',
  'Rubick','Shadow Fiend','Shadow Demon','Spectre','Techies',
  'Templar Assassin','Timbersaw','Troll Warlord','Tusk','Vengeful Spirit'
];

const sources = [
  {
    name: 'abilities',
    url: 'http://www.dota2.com/jsfeed/abilitydata',
    transform: response => {
      const abilityData = response.abilitydata;
      const abilities = [];

      Object.keys(abilityData).filter(ability => !ability.includes('special')).forEach((abilityKey) => {
        const ability = {};

        if (abilityData[abilityKey].hurl === 'Natures_Prophet') {
          ability.hero = 'Nature\'s Prophet';
        } else {
          ability.hero = abilityData[abilityKey].hurl.split('_').join(' ');
        }

        if (!unavailableHeroes.includes(ability.hero)) {
          ability.name = abilityData[abilityKey].dname;
          ability.slug = abilityKey;
          ability.description = abilityData[abilityKey].desc;
          ability.img = 'http://cdn.dota2.com/apps/dota2/images/abilities/' + abilityKey + '_md.png';
          // ability.attributes = abilityData[abilityKey].attrib;
          // ability.cmb = abilityData[abilityKey].cmb;
          // ability.damage = abilityData[abilityKey].dmg;
          // ability.effects = abilityData[abilityKey].affects;
          // ability.lore = abilityData[abilityKey].lore;
          // ability.notes = abilityData[abilityKey].notes;
          abilities.push(ability);
        }
      });

      return abilities;
    },
  },
  {
    name: 'heroes',
    url: 'https://api.opendota.com/api/heroes',
    transform: response => {
      const heroes = [];

      const compareHero = (a, b) => {
        if (a.name > b.name) { return 1; }
        if (a.name < b.name) { return -1; }
        return 0;
      };

      response.forEach((hero) => {
        if (!unavailableHeroes.includes(hero.localized_name)) {
          hero.slug = hero.name.replace('npc_dota_hero_', '');
          hero.name = hero.localized_name;
          hero.img = 'http://cdn.dota2.com/apps/dota2/images/heroes/' + hero.slug + '_full.png';
          hero.icon = 'http://cdn.dota2.com/apps/dota2/images/heroes/' + hero.slug + '_icon.png';
          hero.skills = [];
          delete hero.localized_name;
          heroes.push(hero);
        }
      });

      heroes.sort(compareHero);
      return heroes;
    },
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
