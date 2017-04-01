import fs from 'fs';
import path from 'path';

const configurationFilePath = path.join(__dirname, '../../../../configuration.json');

let buffer;
let configurationJson;

try {
  buffer = fs.readFileSync(configurationFilePath);
  configurationJson = JSON.parse(buffer);
} catch (err) { // Grab from environment variables instead
  configurationJson = {
    databaseConnections: {
      postgres: {
        PROD: process.env.DB_URL,
      },
    },
    env: process.env.ENV,
    port: process.env.PORT,
    jwt: {
      secret: process.env.JWT_SECRET,
    },
  };
}

export default configurationJson;
