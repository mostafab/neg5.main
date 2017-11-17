import { hasToken } from '../../auth/middleware/token';
import { accessToTournament, adminAccessToTournament, directorAccessToTournament } from '../../auth/middleware/tournament-access';

import TournamentManager from '../../managers/model-managers/tournament';

export default (app) => {

  app.route('/api/t')
      .get(hasToken, (req, res) => {
        TournamentManager.findByUser(req.currentUser)
            .then(data => res.json({ data, success: true }))
            .catch(error => res.status(500).send({ error, success: false }));
      })
      .post(hasToken, (req, res) => {
        TournamentManager.create(req.body, req.currentUser)
            .then(result => res.json({ result, success: true }))
            .catch(error => res.status(500).send({ error }));
      });
  
  app.route('/api/t/findRecent')
      .get((req, res) => {
          TournamentManager.findRecent(req.query.days)
            .then(result => res.json({ result, success: true }))
            .catch(error => res.status(500).send({ error: error.message }));
      });

  app.route('/api/t/byDateRange')
      .get((req, res) => {
          TournamentManager.findBetweenDates(req.query.startDate, req.query.endDate)
            .then(result => res.json({ result, success: true }))
            .catch(error => res.status(500).send({ error: error.message }));
      });

  app.route('/api/t/byName')
      .get((req, res) => {
        TournamentManager.findByName(req.query.searchQuery)
            .then(result => res.json({ result, success: true }))
            .catch(error => res.status(500).send({ error: error.message }));
      })

  app.route('/api/t/:tid')
      .get(hasToken, accessToTournament, (req, res) => {
        TournamentManager.findById(req.params.tid, req.currentUser)
            .then(data => res.json({ data, success: true }))
            .catch(error => res.send({ error, success: false }));
      })
      .put(hasToken, adminAccessToTournament, (req, res) => {
        TournamentManager.update(req.params.tid, req.body)
            .then(result => res.json({ result, success: true }))
            .catch(error => res.status(500).send({ error, success: false }));
      });

  app.route('/api/t/:tid/info')
    .get((req, res) => {
        TournamentManager.findById(req.params.tid, null)
            .then(result => res.json({ result: result.tournament, success: true }))
            .catch(error => res.send({ error, success: false }));
    })    

  app.route('/api/t/:tid/rules')
      .put(hasToken, directorAccessToTournament, (req, res) => {
          TournamentManager.updateRules(req.params.tid, req.body.rules)
              .then(result => res.json({result, success: true}))
              .catch(error => res.status(500).send({error, success: false}));
      })
  
  app.route('/api/t/:tid/collaborators')
      .get(hasToken, accessToTournament, (req, res) => {
          TournamentManager.findCollaborators(req.params.tid)
              .then(result => res.json({result, success: true}))
              .catch(error => res.status(500).send({error, success: false}))
      })
      .post(hasToken, adminAccessToTournament, (req, res) => {
          TournamentManager.addCollaborator(req.params.tid, req.currentUser, req.body.username, req.body.admin)
              .then(result => res.json({result, success: true}))
              .catch(error => res.status(500).send({error, success: false}))
      })

  app.route('/api/t/:tid/collaborators/:username')
      .put(hasToken, directorAccessToTournament, (req, res) => {
          TournamentManager.updateCollaborator(req.params.tid, req.params.username, req.body.admin)
              .then(result => res.json({result, success: true}))
              .catch(error => res.status(500).send({error, success: false}));
      })
      .delete(hasToken, directorAccessToTournament, (req, res) => {
          TournamentManager.removeCollaborator(req.params.tid, req.params.username)
              .then(result => res.json({result, success: true}))
              .catch(error => res.status(500).json({error, success: false}))
      })

  app.route('/api/t/:tid/pointscheme')
      .get((req, res) => {
          TournamentManager.findById(req.params.tid)
            .then(result => res.json({ result: result.tournament.tossup_point_scheme, success: true }))
            .catch(err => res.status(500).send({ error: err, success: false}));
      })
      .post(hasToken, directorAccessToTournament, (req, res) => {
          TournamentManager.addTossupPointValue(req.params.tid, req.body)
              .then(result => res.json({result, success: true}))
              .catch(error => res.status(500).send({error, success: false}));
      })
      .put(hasToken, directorAccessToTournament, (req, res) => {
          TournamentManager.updateTossupPointValues(req.params.tid, req.body.pointValues)
              .then(result => res.json({result, success: true}))
              .catch(error => res.status(500).send({error}))
      })
      
  app.route('/api/t/:tid/divisions')
      .get((req, res) => {
          TournamentManager.getDivisions(req.params.tid)
              .then(result => res.json({result, success: true}))
              .catch(error => res.status(500).send({error, success: false}));
      })
      .post(hasToken, adminAccessToTournament, (req, res) => {
          TournamentManager.addDivision(req.params.tid, req.body.name, req.body.phaseId)
              .then(result => res.json({ result, success: true }))
              .catch(error => res.status(500).send({ error, success: false }));
      })

  app.route('/api/t/:tid/divisions/:divisionId')
      .put(hasToken, adminAccessToTournament, (req, res) => {
          TournamentManager.editDivision(req.params.tid, req.params.divisionId, req.body.newName)
              .then(result => res.json({result, success: true}))
              .catch(error => res.status(500).send({error, success: false}));
      })
      .delete(hasToken, adminAccessToTournament, (req, res) => {
          TournamentManager.removeDivision(req.params.tid, req.params.divisionId)
              .then(result => res.json({result, success: true}))
              .catch(error => res.status(500).send({error, success: false}));
      })

  app.route('/api/t/:tid/phases')
      .get((req, res) => {
          TournamentManager.getPhases(req.params.tid)
              .then(result => res.json({result, success: true}))
              .catch(error => res.status(500).send({error, success: false}));
      })
      .post(hasToken, directorAccessToTournament, (req, res) => {
          TournamentManager.addPhase(req.params.tid, req.body.name)
              .then(result => res.json({result, success: true}))
              .catch(error => res.status(500).send({error, success: false}));
      })

  app.route('/api/t/:tid/phases/:phaseId')
      .put(hasToken, directorAccessToTournament, (req, res) => {
          TournamentManager.updatePhase(req.params.tid, req.params.phaseId, req.body.newName)
              .then(result => res.json({result, success: true}))
              .catch(error => res.status(500).send({error, success: false}));
      })
      .delete(hasToken, directorAccessToTournament, (req, res) => {
          TournamentManager.removePhase(req.params.tid, req.params.phaseId)
              .then(result => res.json({result, success: true}))
              .catch(error => res.status(500).send({error, success: false}));
      })

  app.route('/api/t/:tid/phases/:phaseId/active')
      .put(hasToken, directorAccessToTournament, (req, res) => {
          TournamentManager.setActivePhase(req.params.tid, req.params.phaseId)
              .then(result => res.json({result, success: true}))
              .catch(error => res.status(500).send({error, success: false}));
      })
    
}