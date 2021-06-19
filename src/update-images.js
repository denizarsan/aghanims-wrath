const fs = require('fs');
const path = require('path');
const axios = require('axios');

const DATA_DIR = './src/assets/';
const DATA_FILE = 'data.json';
const ASSETS_DIR = './public/images';

const ENDPOINT_HERO_IMG = 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/';
const ENDPOINT_ABILITY_IMG = 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/';

if (!fs.existsSync(ASSETS_DIR)) {
  fs.mkdirSync(ASSETS_DIR);
}

const getHeroImg = (slug) => axios.get(`${ENDPOINT_HERO_IMG}${slug}.png`, { responseType: 'arraybuffer' })
  .then(r => Buffer.from(r.data, 'binary'));
const getAbilityImg = (slug) => axios.get(`${ENDPOINT_ABILITY_IMG}${slug}.png`, { responseType: 'arraybuffer' })
  .then(r => Buffer.from(r.data, 'binary'));

const getImages = async (heroes, abilities) => {
  await Promise.all(heroes.map(async (h) => {
    const img = await getHeroImg(h.hero);
    fs.writeFileSync(path.join(ASSETS_DIR, h.hero + '.png'), img);
  }))

  await Promise.all(abilities.ultimates.map(async (u) => {
    const img = await getAbilityImg(u.id);
    fs.writeFileSync(path.join(ASSETS_DIR, u.id + '.png'), img);
  }))

  await Promise.all(abilities.scepter.abilities.map(async (a) => {
    const img = await getAbilityImg(a.id);
    fs.writeFileSync(path.join(ASSETS_DIR, a.id + '.png'), img);
  }))

  await Promise.all(abilities.scepter.upgrades.map(async (u) => {
    const img = await getAbilityImg(u.id);
    fs.writeFileSync(path.join(ASSETS_DIR, u.id + '.png'), img);
  }))

  await Promise.all(abilities.shard.abilities.map(async (a) => {
    const img = await getAbilityImg(a.id);
    fs.writeFileSync(path.join(ASSETS_DIR, a.id + '.png'), img);
  }))

  await Promise.all(abilities.shard.upgrades.map(async (u) => {
    const img = await getAbilityImg(u.id);
    fs.writeFileSync(path.join(ASSETS_DIR, u.id + '.png'), img);
  }))
}

const updateImages = async () => {
  const data = JSON.parse(fs.readFileSync(path.join(DATA_DIR, DATA_FILE)));
  await getImages(data.heroes, data.abilities);
};

updateImages();
