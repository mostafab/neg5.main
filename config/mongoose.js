var config = require("./config");
var mongoose = require("mongoose");

module.exports = function() {
    var db = mongoose.connect(config.db_production);
    var conn = mongoose.connection;
    conn.on('error', console.error.bind(console, "Connection Error: "));
    conn.once('open', function(callback) {
        // Nothing needs to go here
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
