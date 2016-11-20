'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _passportFacebook = require('passport-facebook');

exports.default = function (passport) {
    return passport.use(new _passportFacebook.Strategy({
        clientID: 'sdada',
        clientSecret: 'MySecret',
        callbackURL: 'http://test.com/callback'
    }, function (accessToken, refreshToken, profile, done) {}));
};