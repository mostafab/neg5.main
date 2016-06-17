'use strict';

var _configuration = require('./config/configuration');

var _configuration2 = _interopRequireDefault(_configuration);

var _express = require('./config/express');

var _express2 = _interopRequireDefault(_express);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var mongoose = require('./config/mongoose');

var postgres = require('./database/postgres');

var db = mongoose();
var app = (0, _express2.default)();

var PORT_NUM = _configuration2.default.port;

app.listen(PORT_NUM);

module.exports = app;

console.log('Server running at http://localhost:' + PORT_NUM);