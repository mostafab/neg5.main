'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _token = require('../../auth/middleware/token');

var _tournamentAccess = require('../../auth/middleware/tournament-access');

var _tournament = require('../../models/sql-models/tournament');

var _tournament2 = _interopRequireDefault(_tournament);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (app) {

    app.route('/api/t').get(_token.hasToken, function (req, res) {
        _tournament2.default.findByUser(req.currentUser).then(function (data) {
            return res.json({ data: data, success: true });
        }).catch(function (error) {
            return res.status(500).send({ error: error, success: false });
        });
    }).post(_token.hasToken, function (req, res) {
        _tournament2.default.create(req.body, req.currentUser).then(function (result) {
            return res.json({ result: result, success: true });
        }).catch(function (error) {
            return res.status(500).send({ error: error });
        });
    });

    app.route('/api/t/:tid').get(_token.hasToken, _tournamentAccess.accessToTournament, function (req, res) {
        _tournament2.default.findById(req.params.tid, req.currentUser).then(function (data) {
            return res.json({ data: data, success: true });
        }).catch(function (error) {
            return res.send({ error: error, success: false });
        });
    }).put(_token.hasToken, _tournamentAccess.adminAccessToTournament, function (req, res) {
        _tournament2.default.update(req.params.tid, req.body).then(function (result) {
            return res.json({ result: result, success: true });
        }).catch(function (error) {
            return res.status(500).send({ error: error, success: false });
        });
    }).delete(function (req, res) {});

    app.route('/api/t/:tid/rules').put(_token.hasToken, _tournamentAccess.directorAccessToTournament, function (req, res) {
        _tournament2.default.updateRules(req.params.tid, req.body.rules).then(function (result) {
            return res.json({ result: result, success: true });
        }).catch(function (error) {
            return res.status(500).send({ error: error, success: false });
        });
    });

    app.route('/api/t/:tid/collaborators').get(_token.hasToken, _tournamentAccess.accessToTournament, function (req, res) {
        _tournament2.default.findCollaborators(req.params.tid).then(function (result) {
            return res.json({ result: result, success: true });
        }).catch(function (error) {
            return res.status(500).send({ error: error, success: false });
        });
    }).post(_token.hasToken, _tournamentAccess.adminAccessToTournament, function (req, res) {
        _tournament2.default.addCollaborator(req.params.tid, req.currentUser, req.body.username, req.body.admin).then(function (result) {
            return res.json({ result: result, success: true });
        }).catch(function (error) {
            return res.status(500).send({ error: error, success: false });
        });
    });

    app.route('/api/t/:tid/collaborators/:username').put(_token.hasToken, _tournamentAccess.directorAccessToTournament, function (req, res) {
        _tournament2.default.updateCollaborator(req.params.tid, req.params.username, req.body.admin).then(function (result) {
            return res.json({ result: result, success: true });
        }).catch(function (error) {
            return res.status(500).send({ error: error, success: false });
        });
    }).delete(_token.hasToken, _tournamentAccess.directorAccessToTournament, function (req, res) {
        _tournament2.default.removeCollaborator(req.params.tid, req.params.username).then(function (result) {
            return res.json({ result: result, success: true });
        }).catch(function (error) {
            return res.status(500).json({ error: error, success: false });
        });
    });

    app.route('/api/t/:tid/pointscheme').post(_token.hasToken, _tournamentAccess.directorAccessToTournament, function (req, res) {
        _tournament2.default.addTossupPointValue(req.params.tid, req.body).then(function (result) {
            return res.json({ result: result, success: true });
        }).catch(function (error) {
            return res.status(500).send({ error: error, success: false });
        });
    }).put(_token.hasToken, _tournamentAccess.directorAccessToTournament, function (req, res) {
        _tournament2.default.updateTossupPointValues(req.params.tid, req.body.pointValues).then(function (result) {
            return res.json({ result: result, success: true });
        }).catch(function (error) {
            return res.status(500).send({ error: error });
        });
    });

    app.route('/api/t/:tid/divisions').get(function (req, res) {
        _tournament2.default.getDivisions(req.params.tid).then(function (result) {
            return res.json({ result: result, success: true });
        }).catch(function (error) {
            return res.status(500).send({ error: error, success: false });
        });
    }).post(_token.hasToken, _tournamentAccess.adminAccessToTournament, function (req, res) {
        _tournament2.default.addDivision(req.params.tid, req.body.name, req.body.phaseId).then(function (result) {
            return res.json({ result: result, success: true });
        }).catch(function (error) {
            return reject(error);
        });
    });

    app.route('/api/t/:tid/divisions/:divisionId').put(_token.hasToken, _tournamentAccess.adminAccessToTournament, function (req, res) {
        _tournament2.default.editDivision(req.params.tid, req.params.divisionId, req.body.newName).then(function (result) {
            return res.json({ result: result, success: true });
        }).catch(function (error) {
            return res.status(500).send({ error: error, success: false });
        });
    }).delete(_token.hasToken, _tournamentAccess.adminAccessToTournament, function (req, res) {
        _tournament2.default.removeDivision(req.params.tid, req.params.divisionId).then(function (result) {
            return res.json({ result: result, success: true });
        }).catch(function (error) {
            return res.status(500).send({ error: error, success: false });
        });
    });

    app.route('/api/t/:tid/phases').get(function (req, res) {
        _tournament2.default.getPhases(req.params.tid).then(function (result) {
            return res.json({ result: result, success: true });
        }).catch(function (error) {
            return res.status(500).send({ error: error, success: false });
        });
    }).post(_token.hasToken, _tournamentAccess.directorAccessToTournament, function (req, res) {
        _tournament2.default.addPhase(req.params.tid, req.body.name).then(function (result) {
            return res.json({ result: result, success: true });
        }).catch(function (error) {
            return res.status(500).send({ error: error, success: false });
        });
    });

    app.route('/api/t/:tid/phases/:phaseId').put(_token.hasToken, _tournamentAccess.directorAccessToTournament, function (req, res) {
        _tournament2.default.updatePhase(req.params.tid, req.params.phaseId, req.body.newName).then(function (result) {
            return res.json({ result: result, success: true });
        }).catch(function (error) {
            return res.status(500).send({ error: error, success: false });
        });
    }).delete(_token.hasToken, _tournamentAccess.directorAccessToTournament, function (req, res) {
        _tournament2.default.removePhase(req.params.tid, req.params.phaseId).then(function (result) {
            return res.json({ result: result, success: true });
        }).catch(function (error) {
            return res.status(500).send({ error: error, success: false });
        });
    });

    app.route('/api/t/:tid/phases/:phaseId/active').put(_token.hasToken, _tournamentAccess.directorAccessToTournament, function (req, res) {
        _tournament2.default.setActivePhase(req.params.tid, req.params.phaseId).then(function (result) {
            return res.json({ result: result, success: true });
        }).catch(function (error) {
            return res.status(500).send({ error: error, success: false });
        });
    });
};