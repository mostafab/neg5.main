'use strict';

import {hasToken} from './../auth/middleware/token';
import {accessToTournament} from './../auth/middleware/tournament-access';
import Tournament from './../models/sql-models/tournament';

module.exports = app => {

    const index = require('../controllers/index-controller');

    app.get('/', (req, res) => {
        if (req.cookies.nfToken) {
            res.redirect('/tournaments');
        } else {
            index.render(req, res);
        }
    });

    app.get("/tournaments", (req, res, next) => {
        if (!req.cookies.nfToken) {
            res.redirect('/');
        } else {
            res.render('tournament/alltournaments');
        }        
    });

    app.get("/t/:tid", hasToken, accessToTournament, (req, res, next) => {
        res.render("tournament/tournament-view", {tournamentd : req.currentUser});
    });

    app.get("/about", (req, res) => {
        res.render("index/about", {tournamentd : req.session.director});
    });
    
};
