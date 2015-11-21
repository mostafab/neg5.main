var config = require('./config');
var express = require('express');
var bodyParser = require("body-parser");
var session = require("client-sessions");

module.exports = function() {
    var app = express();
    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(bodyParser.json());
    app.use(session({
        cookieName : "session",
        secret : "TheresAlwaysMoneyInTheBananaStand",
        duration : 180 * 60 * 1000,
        activeDuration : 180 * 60 * 1000,
        httpOnly : true,
        secure : true,
        ephemeral : true
    }));
    app.set("views", "./app/views");
    app.set("view engine", "jade");

    require('../app/routes/index.js')(app);
    require("../app/routes/user-route.js")(app);
    require("../app/routes/tournaments-route.js")(app);

    app.use(express.static("./public"));

    return app;
};
