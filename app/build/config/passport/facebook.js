'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _passportFacebook = require('passport-facebook');

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (passport) {

    if (_config2.default.facebook) {
        var _Config$facebook = _config2.default.facebook;
        var clientID = _Config$facebook.clientID;
        var clientSecret = _Config$facebook.clientSecret;
        var callbackURL = _Config$facebook.callbackURL;


        passport.use(new _passportFacebook.Strategy({
            clientID: clientID,
            clientSecret: clientSecret,
            callbackURL: callbackURL
        }, function (accessToken, refreshToken, profile, verifyCallback) {
            var user = profile;
            user.token = 'TEST TOKEN';
            verifyCallback(null, user);
        }));
    }
};