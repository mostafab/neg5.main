import { hashExpression, compareToHash } from '../helpers/crypto';
import { encode } from '../helpers/jwt';

import { query, queryTypeMap as qm } from '../database/db';
import sql from '../database/sql';

const accountSQL = sql.account;

export default {
  getUserPermissions: (username, tournamentId) => new Promise((resolve, reject) => {
    const params = [tournamentId, username];
    query(accountSQL.permissions, params, qm.any)
        .then(result => resolve(result))
        .catch(error => reject(error));
  }),

  saveAccount: ({ username, password, email = null, name = null }) =>
        new Promise((resolve, reject) => {
          hashExpression(password)
              .then((hash) => {
                const params = [username, hash, email, name];
                return query(accountSQL.add, params, qm.one);
              })
              .then(user => resolve(user.username))
              .catch(error => reject(error));
        }),

  authenticateAccount: ({ user, password }) => new Promise((resolve, reject) => {
    const params = [user];
    let retrievedUsername = null;
    query(accountSQL.findOne, params, qm.one)
        .then(({ username, hash }) => {
          retrievedUsername = username;
          return compareToHash(password, hash);
        })
        .then(({ match }) => {
          if (!match) return reject({ authenticated: false });
          const token = encode(retrievedUsername);
          return resolve(token);
        })
        .catch(error => reject(error));
  }),

  findByQuery: searchQuery => new Promise((resolve, reject) => {
    const expression = `%${searchQuery}%`;
    const params = [expression];
    query(accountSQL.findUsers, params, qm.any)
        .then(users => resolve(users))
        .catch(error => reject(error));
  }),
};
