'use strict';

var _pg = require('pg');

var _pg2 = _interopRequireDefault(_pg);

var _configuration = require('../config/configuration');

var _configuration2 = _interopRequireDefault(_configuration);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var connectionString = _configuration2.default.databaseConnections.postgres.local;

module.exports = new _pg2.default.Client(connectionString);