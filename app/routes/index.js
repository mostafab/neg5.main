module.exports = app => {

    const index = require('../controllers/index-controller');

    app.get('/', (req, res) => {
        if (req.session.director) {
            res.redirect("/home");
        } else {
            index.render(req, res);
        }
    });

    app.get("/about", (req, res) => {
        res.render("about", {tournamentd : req.session.director});
    });
};
