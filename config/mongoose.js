var config = require("./config");
var mongoose = require("mongoose");

module.exports = function() {
    var db = mongoose.connect(config.db);
    var conn = mongoose.connection;
    conn.on('error', console.error.bind(console, "Connection Error: "));
    conn.once('open', function(callback) {
        // Nothing needs to go here
    });
    require("../app/models/user");
    return db;
}
