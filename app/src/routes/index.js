'use strict'

import { hasToken } from './../auth/middleware/token';
import { accessToTournament } from './../auth/middleware/tournament-access';
import Tournament from './../models/sql-models/tournament';

module.exports = app => {

  const minifyJs = app.get('minifyJs')

  app.get('/', (req, res) => {
      if (req.cookies.nfToken) {
          res.redirect('/tournaments');
      } else {
          res.render("index/index", {minifyJs});
      }
  });

  app.get("/tournaments", (req, res, next) => {
      if (!req.cookies.nfToken) {
          res.redirect('/');
      } else {
          res.render('tournament/alltournaments', {minifyJs});
      }        
  });

  app.get("/t/:tid", hasToken, accessToTournament, (req, res, next) => {
    res.render("tournament/tournament-view", {minifyJs})
  });

  app.get('/t/:tid/stats', (req, res) => {
    res.render('stats/stats-home', {minifyJs});
  });

  app.get('/t/:tid/stats/:page(team|player|teamfull|playerfull|roundreport)/', (req, res) => {
    const url = req.url;
    res.redirect(`https://v1.neg5.org${url}`);
  });
};
