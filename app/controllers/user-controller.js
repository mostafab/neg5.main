var User = require("mongoose").model("User");

exports.create = function(req, res, next) {
    var name = req.body["r_name"];
    var email = req.body["r_usrname"];
    var password = req.body["r_pswd"];
    var user = new User({
            name : name,
            email : email,
            password : password,
        });
    user.save(function(err) {
        if (err) {
            return next(err);
        } else {
            res.render("index", {title : "Thanks for Registering, " + name + "!",
                                message : "Login to Continue."
            });
        }
    });
};
