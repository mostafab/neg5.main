import db from './../../data-access/account';

export const accessToTournament = (req, res, next) => {
  const username = req.currentUser;
  const tournamentId = req.params.tid;
  db.getUserPermissions(username, tournamentId)
      .then((result) => {
        if (result.length === 0) return res.status(403).send({ error: 'Access to this endpoint is denied' });
        return next();
      })
      .catch((error) => {
          res.status(500).send({error});
      });
}

export let adminAccessToTournament = (req, res, next) => {
  let username = req.currentUser;
  let tournamentId = req.params.tid;

  db.getUserPermissions(username, tournamentId)
      .then(result => {
          if (result.length === 0) return res.status(403).send({error: 'Access to this endpoint is denied'});

          let permissions = result[0];
          let {is_admin, is_owner} = permissions;
          if (is_admin || is_owner) {
              next();
          } else {
              return res.status(403).send({error: 'Access to this endpoint is denied'});
          }
      })
      .catch(error => {
          res.status(500).send({error});
      });
}

export let directorAccessToTournament = (req, res, next) => {
  let username = req.currentUser;
  let tournamentId = req.params.tid;

  db.getUserPermissions(username, tournamentId)
      .then(result => {
          if (result.length === 0) return res.status(403).send({error: 'Access to this endpoint is denied'});

          let {is_owner} = result[0];
          if (is_owner) {
              next();
          } else {
              return res.status(403).send({error: 'Access to this endpoint is denied'});
          }
      })
      .catch(error => {
          res.status(500).send({error});
      });
}