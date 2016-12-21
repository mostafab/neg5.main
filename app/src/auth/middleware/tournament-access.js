import db from './../../data-access/account';

export const accessToTournament = (req, res, next) => {
  const username = req.currentUser;
  const tournamentId = req.params.tid;
  db.getUserPermissions(username, tournamentId)
      .then((result) => {
        if (result.length === 0) return res.status(403).send({ error: 'Access to this endpoint is denied' });
        return next();
      })
      .catch(error => res.status(500).send({ error }));
};

export const adminAccessToTournament = (req, res, next) => {
  const username = req.currentUser;
  const tournamentId = req.params.tid;

  db.getUserPermissions(username, tournamentId)
      .then((result) => {
        if (result.length === 0) return res.status(403).send({ error: 'Access to this endpoint is denied' });

        const permissions = result[0];
        const { is_admin: isAdmin, is_owner: isOwner } = permissions;
        if (isAdmin || isOwner) {
          return next();
        }
        return res.status(403).send({ error: 'Access to this endpoint is denied' });
      })
      .catch(error => res.status(500).send({ error }));
};

export const directorAccessToTournament = (req, res, next) => {
  const username = req.currentUser;
  const tournamentId = req.params.tid;

  db.getUserPermissions(username, tournamentId)
      .then((result) => {
        if (result.length === 0) return res.status(403).send({ error: 'Access to this endpoint is denied' });

        const { is_owner: isOwner } = result[0];
        if (isOwner) {
          return next();
        }
        return res.status(403).send({ error: 'Access to this endpoint is denied' });
      })
      .catch(error => res.status(500).send({ error }));
};
