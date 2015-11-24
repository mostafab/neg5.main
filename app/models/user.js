var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var bcryptjs = require("bcryptjs");
var SALT_WORK_FACTOR = 10;


function toLower(string) {
    return string.toLowerCase();
}

var UserSchema = new Schema({
    name : {type : String, required : true},
    email : {type : String, required : true, set : toLower},
    password : {type : String, required : true},
});

// UserSchema.pre("save", function(next) {
//     if (!this.isModified("password")) {
//         return next();
//     }
//     bcryptjs.genSalt(SALT_WORK_FACTOR, function(err, salt) {
//         if (err) {
//             console.log("Err 1: " + err);
//             return next(err);
//         }
//         bcryptjs.hash(this.password, salt, function(err, hash) {
//             if (err) {
//                 console.log("Err 2: " + err);
//                 return next(err);
//             }
//             this.password = hash;
//             next();
//         });
//     });
// });

UserSchema.methods.comparePassword = function(testingPassword, cb) {
    bcryptjs.compare(testingPassword, this.password, function(err, isMatch) {
        if (err) {
            return cb(err);
        } else {
            cb(null, isMatch);
        }
    });
}

module.exports = mongoose.model("User", UserSchema);
