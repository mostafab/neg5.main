"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = {

    createAccount: function createAccount(username, password) {
        return new Promise(function (resolve, reject) {
            var newAccount = {
                username: username,
                password: password
            };
            db.saveAccount(newAccount).then(function (user) {
                return resolve(user);
            }).catch(function (error) {
                return reject(error);
            });
        });
    },

    retrieveAccount: function retrieveAccount(username, password) {
        return new Promise(function (resolve, reject) {
            var accountToRetrieve = {
                username: username,
                password: password
            };
            db.getAccount(accountToRetrieve).then(function (user) {
                return resolve(user);
            }).catch(function (error) {
                return reject(error);
            });
        });
    }

};