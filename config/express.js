var config = require('./config');
var express = require('express');
var bodyParser = require("body-parser");

module.exports = function() {
    var app = express();
    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(bodyParser.json());

    app.set("views", "./app/views");
    app.set("view engine", "jade");

    require('../app/routes/index.js')(app);
    require("../app/routes/user-route.js")(app);

    app.use(express.static("./public"));
    
    return app;
};
