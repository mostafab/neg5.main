import fs from 'fs';
import path from 'path';

const configurationFilePath = path.join(__dirname, '../../../../configuration.json');

let buffer;
let configurationJson;

try {
  buffer = fs.readFileSync(configurationFilePath);
  configurationJson = JSON.parse(buffer);
} catch (err) {
  throw err;
}

export default configurationJson;
