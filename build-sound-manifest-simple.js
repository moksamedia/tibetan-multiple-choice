const fs = require('fs');
const path = require('path');

const soundsDir = path.join(__dirname, 'public', 'sounds');
const files = fs.readdirSync(soundsDir)
  .filter(file => file.match(/\.(mp3|wav|ogg)$/i));

fs.writeFileSync(
  path.join(__dirname, 'public', 'sound-manifest.json'),
  JSON.stringify(files, null, 2)
);