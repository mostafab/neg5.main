'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _db = require('../database/db');

var _crypto = require('../helpers/crypto');

var _jwt = require('../helpers/jwt');

exports.default = {

    saveAccount: function saveAccount(_ref) {
        var username = _ref.username;
        var password = _ref.password;

        return new Promise(function (resolve, reject) {
            (0, _crypto.hashExpression)(password).then(function (hash) {
                var insertQuery = 'INSERT INTO account (username, hash) VALUES ($1, $2) RETURNING username';
                var params = [username, hash];
                return (0, _db.promiseQuery)(insertQuery, params);
            }).then(function (user) {
                resolve(user.username);
            }).catch(function (error) {
                console.log(error);
                reject(error);
            });
        });
    },

    authenticateAccount: function authenticateAccount(_ref2) {
        var user = _ref2.user;
        var password = _ref2.password;

        return new Promise(function (resolve, reject) {
            var selectQuery = 'SELECT username, hash from account WHERE username=$1 LIMIT 1';
            var params = [user];
            (0, _db.promiseQuery)(selectQuery, params).then(function (_ref3) {
                var username = _ref3.username;
                var hash = _ref3.hash;


                (0, _crypto.compareToHash)(password, hash).then(function (_ref4) {
                    var match = _ref4.match;

                    if (!match) return reject({ authenticated: false });
                    var token = (0, _jwt.encode)(username);
                    resolve(token);
                }).catch(function (error) {
                    return reject({ error: error });
                });
            }).catch(function (error) {
                return reject(error);
            });
        });
    }

};