import fs from 'fs';
import path from 'path';

const configurationFilePath = path.join(__dirname, '../../../../../passport-config.json');

let buffer;
let configurationJson = {};

try {
  buffer = fs.readFileSync(configurationFilePath);
  configurationJson = JSON.parse(buffer);
} catch (err) {
  process.stdout.write('No valid passport-config.json file found. 3rd party login will not be supported.');
}

export default configurationJson;
