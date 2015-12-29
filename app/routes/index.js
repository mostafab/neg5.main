module.exports = function(app) {

    var index = require('../controllers/index-controller');

    app.get('/', function(req, res) {
        if (req.session.director) {
            res.redirect("/home");
        } else {
            index.render(req, res);
        }
    });

    app.get("/about", function(req, res) {
        res.render("about");
    });
};
