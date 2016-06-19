'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _account = require('../../data-access/account');

var _account2 = _interopRequireDefault(_account);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {

    create: function create(_ref) {
        var username = _ref.username;
        var password = _ref.password;

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

    findOne: function findOne(_ref2) {
        var username = _ref2.username;
        var password = _ref2.password;

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