'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var configurationFilePath = _path2.default.join(__dirname, '../../../../configuration.json');

var buffer = void 0;
var configurationJson = void 0;

try {
  buffer = _fs2.default.readFileSync(configurationFilePath);
  configurationJson = JSON.parse(buffer);
} catch (err) {
  // Grab from environment variables instead
  configurationJson = {
    databaseConnections: {
      postgres: {
        PROD: process.env.DB_URL
      }
    },
    env: process.env.ENV,
    port: process.env.PORT,
    jwt: {
      secret: process.env.JWT_SECRET
    }
  };
}

console.log(configurationJson);

exports.default = configurationJson;