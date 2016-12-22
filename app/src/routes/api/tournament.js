import { hasToken } from '../../auth/middleware/token';
import { accessToTournament, adminAccessToTournament, directorAccessToTournament } from '../../auth/middleware/tournament-access';

import Tournament from '../../models/sql-models/tournament';

export default (app) => {

  app.route('/api/t')
      .get(hasToken, (req, res) => {
        Tournament.findByUser(req.currentUser)
            .then(data => res.json({ data, success: true }))
            .catch(error => res.status(500).send({ error, success: false }));
      })
      .post(hasToken, (req, res) => {
        Tournament.create(req.body, req.currentUser)
            .then(result => res.json({ result, success: true }))
            .catch(error => res.status(500).send({ error }));
      });

  app.route('/api/t/:tid')
      .get(hasToken, accessToTournament, (req, res) => {
        Tournament.findById(req.params.tid, req.currentUser)
            .then(data => res.json({ data, success: true }))
            .catch(error => res.send({ error, success: false }));
      })
      .put(hasToken, adminAccessToTournament, (req, res) => {
        Tournament.update(req.params.tid, req.body)
            .then(result => res.json({ result, success: true }))
            .catch(error => res.status(500).send({ error, success: false }));
      });

  app.route('/api/t/:tid/rules')
      .put(hasToken, directorAccessToTournament, (req, res) => {
          Tournament.updateRules(req.params.tid, req.body.rules)
              .then(result => res.json({result, success: true}))
              .catch(error => res.status(500).send({error, success: false}));
      })
  
  app.route('/api/t/:tid/collaborators')
      .get(hasToken, accessToTournament, (req, res) => {
          Tournament.findCollaborators(req.params.tid)
              .then(result => res.json({result, success: true}))
              .catch(error => res.status(500).send({error, success: false}))
      })
      .post(hasToken, adminAccessToTournament, (req, res) => {
          Tournament.addCollaborator(req.params.tid, req.currentUser, req.body.username, req.body.admin)
              .then(result => res.json({result, success: true}))
              .catch(error => res.status(500).send({error, success: false}))
      })

  app.route('/api/t/:tid/collaborators/:username')
      .put(hasToken, directorAccessToTournament, (req, res) => {
          Tournament.updateCollaborator(req.params.tid, req.params.username, req.body.admin)
              .then(result => res.json({result, success: true}))
              .catch(error => res.status(500).send({error, success: false}));
      })
      .delete(hasToken, directorAccessToTournament, (req, res) => {
          Tournament.removeCollaborator(req.params.tid, req.params.username)
              .then(result => res.json({result, success: true}))
              .catch(error => res.status(500).json({error, success: false}))
      })

  app.route('/api/t/:tid/pointscheme')
      .post(hasToken, directorAccessToTournament, (req, res) => {
          Tournament.addTossupPointValue(req.params.tid, req.body)
              .then(result => res.json({result, success: true}))
              .catch(error => res.status(500).send({error, success: false}));
      })
      .put(hasToken, directorAccessToTournament, (req, res) => {
          Tournament.updateTossupPointValues(req.params.tid, req.body.pointValues)
              .then(result => res.json({result, success: true}))
              .catch(error => res.status(500).send({error}))
      })
      
  app.route('/api/t/:tid/divisions')
      .get((req, res) => {
          Tournament.getDivisions(req.params.tid)
              .then(result => res.json({result, success: true}))
              .catch(error => res.status(500).send({error, success: false}));
      })
      .post(hasToken, adminAccessToTournament, (req, res) => {
          Tournament.addDivision(req.params.tid, req.body.name, req.body.phaseId)
              .then(result => res.json({ result, success: true }))
              .catch(error => res.status(500).send({ error, success: false }));
      })

  app.route('/api/t/:tid/divisions/:divisionId')
      .put(hasToken, adminAccessToTournament, (req, res) => {
          Tournament.editDivision(req.params.tid, req.params.divisionId, req.body.newName)
              .then(result => res.json({result, success: true}))
              .catch(error => res.status(500).send({error, success: false}));
      })
      .delete(hasToken, adminAccessToTournament, (req, res) => {
          Tournament.removeDivision(req.params.tid, req.params.divisionId)
              .then(result => res.json({result, success: true}))
              .catch(error => res.status(500).send({error, success: false}));
      })

  app.route('/api/t/:tid/phases')
      .get((req, res) => {
          Tournament.getPhases(req.params.tid)
              .then(result => res.json({result, success: true}))
              .catch(error => res.status(500).send({error, success: false}));
      })
      .post(hasToken, directorAccessToTournament, (req, res) => {
          Tournament.addPhase(req.params.tid, req.body.name)
              .then(result => res.json({result, success: true}))
              .catch(error => res.status(500).send({error, success: false}));
      })

  app.route('/api/t/:tid/phases/:phaseId')
      .put(hasToken, directorAccessToTournament, (req, res) => {
          Tournament.updatePhase(req.params.tid, req.params.phaseId, req.body.newName)
              .then(result => res.json({result, success: true}))
              .catch(error => res.status(500).send({error, success: false}));
      })
      .delete(hasToken, directorAccessToTournament, (req, res) => {
          Tournament.removePhase(req.params.tid, req.params.phaseId)
              .then(result => res.json({result, success: true}))
              .catch(error => res.status(500).send({error, success: false}));
      })

  app.route('/api/t/:tid/phases/:phaseId/active')
      .put(hasToken, directorAccessToTournament, (req, res) => {
          Tournament.setActivePhase(req.params.tid, req.params.phaseId)
              .then(result => res.json({result, success: true}))
              .catch(error => res.status(500).send({error, success: false}));
      })
    
}