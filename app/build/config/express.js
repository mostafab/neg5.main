'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _clientSessions = require('client-sessions');

var _clientSessions2 = _interopRequireDefault(_clientSessions);

var _cookieParser = require('cookie-parser');

var _cookieParser2 = _interopRequireDefault(_cookieParser);

var _helmet = require('helmet');

var _helmet2 = _interopRequireDefault(_helmet);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function () {
    var app = (0, _express2.default)();

    app.use(_bodyParser2.default.urlencoded({
        extended: true
    }));
    app.use((0, _helmet2.default)());
    app.use((0, _cookieParser2.default)());
    app.use(_bodyParser2.default.json());
    app.use((0, _clientSessions2.default)({
        cookieName: "session",
        secret: "TheresAlwaysMoneyInTheBananaStand",
        duration: 180 * 60 * 1000,
        activeDuration: 180 * 60 * 1000,
        httpOnly: true,
        secure: true
    }));

    app.set("views", _path2.default.join(__dirname, '../../views'));
    app.set("view engine", "jade");

    app.use(_express2.default.static(_path2.default.join(__dirname, '../../public')));

    require('../routes/index.js')(app);
    require("../routes/user-route.js")(app);
    require("../routes/tournaments-route.js")(app);
    require("../routes/stats-route.js")(app);

    return app;
};