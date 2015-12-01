exports.render = function(req, res) {
    res.render("index", {title : "Quetzal",
                        message : "Quizbowl for the Cloud",
                        errormsg : "Welcome to Quetzal, a Quizbowl tournament management system. Login to continue."
    });
};
