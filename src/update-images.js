const axios = require('axios');
const fs = require('fs');
const path = require('path');
const log = require('./logger');

const DATA_FILE = path.resolve('./src/assets/data/data.json');
const ASSETS_DIR = './static/images';
const CDN_URL = 'http://cdn.dota2.com/apps/dota2/images/';

if (!fs.existsSync(DATA_FILE)) {
  log.error(`Data file does not exist in ${DATA_FILE}`);
  process.exit(0);
}

const data = require(DATA_FILE);

log.wait('Updating images...', 'images');

if (!fs.existsSync(ASSETS_DIR)) {
  fs.mkdirSync(ASSETS_DIR);
  log.info(`Created directory ${ASSETS_DIR}`);
}

const images = [];

Object.keys(data).forEach((key) => {
  images.push(data[key].img);
  images.push(data[key].icon);
  data[key].abilities.forEach((ability) => {
    images.push(ability.img);
  });
});

images.forEach((image) => {
  const filename = image.replace(CDN_URL, '').replace(/(heroes|abilities)\//, '');
  const outputPath = path.join(ASSETS_DIR, filename);

  axios.get(image, { responseType: 'arraybuffer' })
    .then((response) => {
      fs.writeFileSync(outputPath, new Buffer(response.data, 'binary'));

      if (image === images[images.length - 1]) {
        log.done('Updated images successfully', 'images');
      }
    });
});
