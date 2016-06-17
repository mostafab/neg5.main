import config from "./configuration";

const mongoose = require("mongoose");

module.exports = () => {
    var db = mongoose.connect(config.databaseConnections.mongo.development);
    var conn = mongoose.connection;
    conn.on('error', console.error.bind(console, "Connection Error: "));
    conn.once('open', () => {
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
}
