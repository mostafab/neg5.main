var mongoose = require("mongoose");
var Schema = mongoose.Schema;

function toLower(string) {
    return string.toLowerCase();
}

var UserSchema = new Schema({
    name : {type : String, required : true},
    email : {type : String, required : true, set : toLower},
    password : {type : String, required : true},
});

module.exports = mongoose.model("User", UserSchema);
