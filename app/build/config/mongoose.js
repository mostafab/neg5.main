"use strict";

var _configuration = require("./configuration");

var _configuration2 = _interopRequireDefault(_configuration);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var mongoose = require("mongoose");

module.exports = function () {
    var env = _configuration2.default.env;
    var db = mongoose.connect(_configuration2.default.databaseConnections.mongo[env]);
    var conn = mongoose.connection;
    conn.on('error', console.error.bind(console, "Connection Error: "));
    conn.once('open', function () {
        console.log('Connected to mongo database');
    });
    require("../models/mongo_schemas/tournament");
    require("../models/mongo_schemas/user");
    require("../models/mongo_schemas/tournament-director");
    require("../models/mongo_schemas/player");
    require("../models/mongo_schemas/team");
    require("../models/mongo_schemas/game");
    require("../models/mongo_schemas/registration");
    return db;
};