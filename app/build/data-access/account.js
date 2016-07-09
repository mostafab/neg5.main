'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _crypto = require('../helpers/crypto');

var _jwt = require('../helpers/jwt');

var _db = require('../database/db');

var _sql = require('../database/sql');

var _sql2 = _interopRequireDefault(_sql);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var account = _sql2.default.account;

exports.default = {

    saveAccount: function saveAccount(_ref) {
        var username = _ref.username;
        var password = _ref.password;

        return new Promise(function (resolve, reject) {
            (0, _crypto.hashExpression)(password).then(function (hash) {

                var params = [username, hash];
                return (0, _db.query)(account.add, params, _db.queryTypeMap.one);
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
            var params = [user];
            (0, _db.query)(account.findOne, params, _db.queryTypeMap.one).then(function (_ref3) {
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