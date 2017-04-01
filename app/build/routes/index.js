'use strict';

var _token = require('./../auth/middleware/token');

var _tournamentAccess = require('./../auth/middleware/tournament-access');

var _tournament = require('./../models/sql-models/tournament');

var _tournament2 = _interopRequireDefault(_tournament);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = function (app) {

    var minifyJs = app.get('minifyJs');

    app.get('/', function (req, res) {
        if (req.cookies.nfToken) {
            res.redirect('/tournaments');
        } else {
            res.render("index/index", { minifyJs: minifyJs });
        }
    });

    app.get("/tournaments", function (req, res, next) {
        if (!req.cookies.nfToken) {
            res.redirect('/');
        } else {
            res.render('tournament/alltournaments', { minifyJs: minifyJs });
        }
    });

    app.get("/t/:tid", _token.hasToken, _tournamentAccess.accessToTournament, function (req, res, next) {
        res.render("tournament/tournament-view", { minifyJs: minifyJs });
    });

    app.get('/t/:tid/stats', function (req, res) {
        res.render('stats/stats-home', { minifyJs: minifyJs });
    });

    app.get('/t/:tid/stats/:page(team|player|teamfull|playerfull|roundreport)/', function (req, res) {
        var url = req.url;
        res.redirect('https://v1.neg5.org' + url);
    });
};