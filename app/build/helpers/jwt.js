'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.encode = undefined;

var _jwtSimple = require('jwt-simple');

var _jwtSimple2 = _interopRequireDefault(_jwtSimple);

var _configuration = require('../config/configuration');

var _configuration2 = _interopRequireDefault(_configuration);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var secret = _configuration2.default.jwt.secret;

var encode = exports.encode = function encode(payload) {
    return _jwtSimple2.default.encode(payload, secret);
};