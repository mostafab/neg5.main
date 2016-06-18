'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _account = require('../../data-access/account');

var _account2 = _interopRequireDefault(_account);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {

    createAccount: function createAccount(username, password) {
        return new Promise(function (resolve, reject) {
            var newAccount = {
                username: username,
                password: password
            };
            _account2.default.saveAccount(newAccount).then(function (user) {
                return resolve(user);
            }).catch(function (error) {
                return reject(error);
            });
        });
    },

    getAccount: function getAccount(username, password) {
        return new Promise(function (resolve, reject) {
            var accountToRetrieve = {
                user: username,
                password: password
            };
            _account2.default.authenticateAccount(accountToRetrieve).then(function (jwt) {
                return resolve(jwt);
            }).catch(function (error) {
                return reject(error);
            });
        });
    }

};