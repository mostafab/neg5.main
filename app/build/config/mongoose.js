"use strict";

var _configuration = require("./configuration");

var _configuration2 = _interopRequireDefault(_configuration);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var mongoose = require("mongoose");

module.exports = function () {
    var db = mongoose.connect(_configuration2.default.databaseConnections.mongo.development);
    var conn = mongoose.connection;
    conn.on('error', console.error.bind(console, "Connection Error: "));
    conn.once('open', function () {
        console.log('Connected to mongo database');
    });
    require("../models/tournament");
    require("../models/user");
    require("../models/tournament-director");
    require("../models/player");
    require("../models/team");
    require("../models/game");
    require("../models/registration");
    return db;
};