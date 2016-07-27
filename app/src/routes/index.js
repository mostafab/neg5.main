'use strict';

import {hasToken} from './../auth/middleware/token';
import Tournament from './../models/sql-models/tournament';

module.exports = app => {

    const index = require('../controllers/index-controller');

    app.get('/', (req, res) => {
        if (req.session.director) {
            res.redirect("/home");
        } else {
            index.render(req, res);
        }
    });

    app.get("/tournaments", hasToken, (req, res, next) => {
        let currentUser = req.currentUser;
        res.render('tournament/alltournaments', {tournamentd: currentUser});
    });

    app.get("/t/:tid", hasToken, (req, res, next) => {
        res.render("tournament/tournament-view", {tournamentd : req.currentUser});
    });

    app.get("/about", (req, res) => {
        res.render("index/about", {tournamentd : req.session.director});
    });
    
};
