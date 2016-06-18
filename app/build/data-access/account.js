'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _pg = require('pg');

var _pg2 = _interopRequireDefault(_pg);

var _postgres = require('../config/database/postgres');

var _postgres2 = _interopRequireDefault(_postgres);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {

    saveAccount: function saveAccount(_ref) {
        var username = _ref.username;
        var password = _ref.password;

        return new Promise(function (resolve, reject) {});
    },

    getAccount: function getAccount(_ref2) {
        var username = _ref2.username;
        var password = _ref2.password;
    }

};