import db from './../../data-access/tournament';

export const findTournament = (req, res, next) => {
  db.findTournamentById(req.params.tid, null, false)
    .then(result => {
      req.tournament = result.tournament;
      next();
    })
    .catch(err => res.status(404).send({ error: err.message}))
}