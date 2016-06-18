'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _db = require('../config/database/db');

var _crypto = require('../helpers/crypto');

exports.default = {

    saveAccount: function saveAccount(_ref) {
        var username = _ref.username;
        var password = _ref.password;

        return new Promise(function (resolve, reject) {
            (0, _crypto.hashExpression)(password).then(function (hash) {
                var query = 'INSERT INTO account (username, hash) VALUES ($1, $2) RETURNING *';
                var params = [username, hash];
                return (0, _db.singleQuery)(query, params);
            }).then(function (user) {
                resolve(user);
            }).catch(function (error) {
                reject(error);
            });
        });
    },

    getAccount: function getAccount(_ref2) {
        var username = _ref2.username;
        var password = _ref2.password;
    }

};