'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var configurationFilePath = _path2.default.join(__dirname, '../../../../../passport-config.json');

var buffer = void 0;
var configurationJson = void 0;

try {
    buffer = _fs2.default.readFileSync(configurationFilePath);
    configurationJson = JSON.parse(buffer);
} catch (err) {
    throw err;
}

exports.default = configurationJson;