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
        var _ref$email = _ref.email;
        var email = _ref$email === undefined ? null : _ref$email;
        var _ref$name = _ref.name;
        var name = _ref$name === undefined ? null : _ref$name;

        return new Promise(function (resolve, reject) {
            var newAccount = {
                username: username.trim().toLowerCase(),
                password: password.trim(),
                email: email === null ? null : email.trim().toLowerCase(),
                name: name === null ? null : name.trim().toLowerCase()
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
                user: username.trim().toLowerCase(),
                password: password.trim()
            };
            _account2.default.authenticateAccount(accountToRetrieve).then(function (jwt) {
                return resolve(jwt);
            }).catch(function (error) {
                return reject(error);
            });
        });
    },

    findByQuery: function findByQuery(query) {
        return new Promise(function (resolve, reject) {
            if (!query) return reject(new Error('No query provided'));

            var searchQuery = query.trim().toLowerCase();
            _account2.default.findByQuery(searchQuery).then(function (users) {
                return resolve(users);
            }).catch(function (error) {
                return reject(error);
            });
        });
    }

};