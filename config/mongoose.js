var config = require("./configuration");
var mongoose = require("mongoose");

module.exports = () => {
    var db = mongoose.connect(config.databaseConnections.mongo.development);
    var conn = mongoose.connection;
    conn.on('error', console.error.bind(console, "Connection Error: "));
    conn.once('open', () => {
        console.log('Connected to mongo database');
    });
    require("../app/models/tournament");
    require("../app/models/user");
    require("../app/models/tournament-director");
    require("../app/models/player");
    require("../app/models/team");
    require("../app/models/game");
    require("../app/models/registration");
    return db;
}
