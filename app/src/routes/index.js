'use strict'

import { hasToken } from './../auth/middleware/token';
import { accessToTournament } from './../auth/middleware/tournament-access';
import { findTournament } from './../auth/middleware/tournament';

import slug from './../helpers/slug';

module.exports = app => {

  const minifyJs = app.get('minifyJs')
  const statsBaseUrl = app.get('STATS_BASE_URL');

  app.get('/', (req, res) => {
      if (req.cookies.nfToken) {
          res.redirect('/tournaments');
      } else {
          res.render("index/index", { statsBaseUrl });
      }
  });

  app.get("/tournaments", (req, res, next) => {
      if (!req.cookies.nfToken) {
          res.redirect('/');
      } else {
          res.render('tournament/alltournaments', {minifyJs});
      }        
  });

  app.get('/t/:tid/stats', findTournament, (req, res) => {
    res.redirect(`/t/${req.params.tid}/${slug(req.tournament.name)}/stats`);
  });

  app.get('/t/:tid/:slug/stats', (req, res) => {
    const redirectUrl = statsBaseUrl + `/t/${req.params.tid}/${req.params.slug}/stats`
    res.redirect(redirectUrl);
  });

  app.get('/t/:tid', hasToken, accessToTournament, (req, res, next) => {
    res.render("tournament/tournament-view", { statsBaseUrl })
  })

  app.get('/t/:tid/stats/:page(team|player|teamfull|playerfull|roundreport)/', (req, res) => {
    res.redirect(`/t/${req.params.tid}/stats`);
  });

  app.get("/t/:tid/:slug", hasToken, accessToTournament, (req, res, next) => {
    res.render("tournament/tournament-view", { statsBaseUrl })
  });
};
