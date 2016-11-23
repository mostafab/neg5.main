'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _passportGoogleOauth = require('passport-google-oauth');

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

var _jwt = require('./../../helpers/jwt');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (passport) {
    var _Config$google = _config2.default.google;
    var clientID = _Config$google.clientID;
    var clientSecret = _Config$google.clientSecret;
    var callbackURL = _Config$google.callbackURL;


    passport.use(new _passportGoogleOauth.OAuth2Strategy({
        clientID: clientID,
        clientSecret: clientSecret,
        callbackURL: callbackURL
    }, function (accessToken, refreshToken, profile, verifyCallback) {
        var user = profile;
        verifyCallback(null, (0, _jwt.encode)(user));
    }));
};