'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.directorAccessToTournament = exports.adminAccessToTournament = exports.accessToTournament = undefined;

var _account = require('./../../data-access/account');

var _account2 = _interopRequireDefault(_account);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var accessToTournament = exports.accessToTournament = function accessToTournament(req, res, next) {
    var username = req.currentUser;
    var tournamentId = req.params.tid;
    _account2.default.getUserPermissions(username, tournamentId).then(function (result) {
        if (result.length === 0) return res.status(403).send({ error: 'Access to this endpoint is denied' });
        return next();
    }).catch(function (error) {
        res.status(500).send({ error: error });
    });
};

var adminAccessToTournament = exports.adminAccessToTournament = function adminAccessToTournament(req, res, next) {
    var username = req.currentUser;
    var tournamentId = req.params.tid;

    _account2.default.getUserPermissions(username, tournamentId).then(function (result) {
        if (result.length === 0) return res.status(403).send({ error: 'Access to this endpoint is denied' });

        var permissions = result[0];
        var is_admin = permissions.is_admin;
        var is_owner = permissions.is_owner;

        if (is_admin || is_owner) {
            next();
        } else {
            return res.status(403).send({ error: 'Access to this endpoint is denied' });
        }
    }).catch(function (error) {
        res.status(500).send({ error: error });
    });
};

var directorAccessToTournament = exports.directorAccessToTournament = function directorAccessToTournament(req, res, next) {
    var username = req.currentUser;
    var tournamentId = req.params.tid;

    _account2.default.getUserPermissions(username, tournamentId).then(function (result) {
        if (result.length === 0) return res.status(403).send({ error: 'Access to this endpoint is denied' });

        var is_owner = result[0].is_owner;

        if (is_owner) {
            next();
        } else {
            return res.status(403).send({ error: 'Access to this endpoint is denied' });
        }
    }).catch(function (error) {
        res.status(500).send({ error: error });
    });
};