var config = require('./config');
var express = require('express');
var bodyParser = require("body-parser");
var clientsession = require("client-sessions");
var passport = require("passport");
var cookieParser = require("cookie-parser");
var favicon = require("serve-favicon");

module.exports = function() {
    var app = express();

    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(cookieParser());
    app.use(bodyParser.json());
    app.use(clientsession({
        cookieName : "session",
        secret : "TheresAlwaysMoneyInTheBananaStand",
        duration : 180 * 60 * 1000,
        activeDuration : 180 * 60 * 1000,
        httpOnly : true,
        secure : true,
        ephemeral : true
    }));
    app.use(passport.initialize());
    app.use(passport.session());

    app.set("views", "./app/views");
    app.set("view engine", "jade");

    app.use(express.static("./public"));


    require('../app/routes/index.js')(app, passport);
    require("../app/routes/user-route.js")(app, passport);
    require("../app/routes/tournaments-route.js")(app, passport);
    require("../app/routes/signup-route.js")(app, passport);
    require("../app/routes/stats-route.js")(app,passport);

    return app;
};
