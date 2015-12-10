exports.render = function(req, res) {
    res.render("index", {title : "Neg 5",
                        message : "Quizbowl for the Cloud",
                        errormsg : "Welcome to Neg 5, a Quizbowl tournament management system. Login to continue."
    });
};
