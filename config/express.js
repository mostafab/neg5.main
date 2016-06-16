const express = require('express');
const bodyParser = require("body-parser");
const clientsession = require("client-sessions");
const cookieParser = require("cookie-parser");
const helmet = require('helmet');

module.exports = () => {
    const app = express();

    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(helmet());
    app.use(cookieParser());
    app.use(bodyParser.json());
    app.use(clientsession({
        cookieName : "session",
        secret : "TheresAlwaysMoneyInTheBananaStand",
        duration : 180 * 60 * 1000,
        activeDuration : 180 * 60 * 1000,
        httpOnly : true,
        secure : true
    }));

    app.set("views", "./app/views");
    app.set("view engine", "jade");
    app.locals.pretty = true;

    app.use(express.static("./public"));

    require('../app/routes/index.js')(app);
    require("../app/routes/user-route.js")(app);
    require("../app/routes/tournaments-route.js")(app);
    require("../app/routes/stats-route.js")(app);

    return app;
};
