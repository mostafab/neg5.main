'use strict';

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _configuration = require('./config/configuration');

var _configuration2 = _interopRequireDefault(_configuration);

var _express = require('./config/express');

var _express2 = _interopRequireDefault(_express);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var mongoose = require('./config/mongoose');

var PORT_NUM = _configuration2.default.port;

var db = mongoose();
var app = (0, _express2.default)();

var server = _http2.default.createServer(app).listen(PORT_NUM);

console.log('Express server running on port ' + PORT_NUM);

module.exports = server;