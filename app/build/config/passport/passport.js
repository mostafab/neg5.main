'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _passport = require('passport');

var _passport2 = _interopRequireDefault(_passport);

var _facebook = require('./facebook');

var _facebook2 = _interopRequireDefault(_facebook);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function initializePassport() {

    var passportInstance = _passport2.default;

    (0, _facebook2.default)(passportInstance);

    return passportInstance;
}

exports.default = initializePassport();