import config from "./configuration";

const mongoose = require("mongoose");

module.exports = () => {
    var db = mongoose.connect(config.databaseConnections.mongo.production);
    var conn = mongoose.connection;
    conn.on('error', console.error.bind(console, "Connection Error: "));
    conn.once('open', () => {
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
}
