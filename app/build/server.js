'use strict';

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _https = require('https');

var _https2 = _interopRequireDefault(_https);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _configuration = require('./config/configuration');

var _configuration2 = _interopRequireDefault(_configuration);

var _express = require('./config/express');

var _express2 = _interopRequireDefault(_express);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _config$https = _configuration2.default.https;
var usingHttps = _config$https === undefined ? false : _config$https;
var httpsDir = _configuration2.default.httpsDir;
var keyName = _configuration2.default.keyName;
var certName = _configuration2.default.certName;
var httpsPort = _configuration2.default.httpsPort;


var PORT_NUM = _configuration2.default.port;

var app = (0, _express2.default)();

var startServer = function startServer() {
    if (usingHttps) {
        var options = {
            key: _fs2.default.readFileSync(httpsDir + keyName, 'utf8'),
            cert: _fs2.default.readFileSync(httpsDir + certName, 'utf8')
        };
        console.log(options.key);
        console.log(options.cert);
        _https2.default.createServer(options, app).listen(httpsPort);
        console.log('Https server running on port ' + httpsPort);
    } else {
        _http2.default.createServer(app).listen(PORT_NUM);
        console.log('Express server running on port ' + PORT_NUM);
    }
};

startServer();