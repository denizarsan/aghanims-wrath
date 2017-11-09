const axios = require('axios');
const fs = require('fs');
const path = require('path');

const data = require('../src/assets/data.json')
const ASSETS_DIR = './static/images';
const CDN_URL = 'http://cdn.dota2.com/apps/dota2/images/';

if (!fs.existsSync(ASSETS_DIR)) {
  fs.mkdirSync(ASSETS_DIR);
}

const images = []

Object.keys(data).forEach((key) => {
  images.push(data[key].img);
  images.push(data[key].icon);
  data[key].abilities.forEach((ability) => {
    images.push(ability.img);
  })
});

images.forEach((image) => {
  const filename = image.replace(CDN_URL, '').replace(/(heroes|abilities)\//, '');
  const outputPath = path.join(ASSETS_DIR, filename);

  axios.get(image, { responseType: 'arraybuffer' })
    .then((response) => fs.writeFileSync(outputPath, new Buffer(response.data, 'binary')));
});
