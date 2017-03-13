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
    url: 'https://raw.githubusercontent.com/odota/dotaconstants/67a3be26c8bddc4f88312f119074071eb2636166/build/abilities.json',
    transform: response => {
      const abilities = [];
      Object.keys(response).filter(ability => !ability.includes('special')).forEach((abilityKey) => {
        const ability = {};
        if (response[abilityKey].hurl === 'Natures_Prophet') {
          ability.hero = 'Nature\'s Prophet';
        } else if (response[abilityKey].hurl === 'MonkeyKing') {
          ability.hero = 'Monkey King';
        } else {
          ability.hero = response[abilityKey].hurl.split('_').join(' ');
        }
        if (!unavailableHeroes.includes(ability.hero)) {
          ability.name = response[abilityKey].dname;
          ability.slug = abilityKey;
          ability.effects = response[abilityKey].affects;
          ability.description = response[abilityKey].desc;
          ability.notes = response[abilityKey].notes;
          ability.damage = response[abilityKey].dmg;
          ability.attributes = response[abilityKey].attrib;
          ability.cmb = response[abilityKey].cmb;
          ability.lore = response[abilityKey].lore;
          ability.img = 'http://cdn.dota2.com' + response[abilityKey].img;
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
