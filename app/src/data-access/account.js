import { hashExpression, compareToHash } from '../helpers/crypto';
import { encode } from '../helpers/jwt';

import { query, queryTypeMap as qm } from '../database/db';
import sql from '../database/sql';

const account = sql.account;

export default {
  getUserPermissions: (username, tournamentId) => new Promise((resolve, reject) => {
    const params = [tournamentId, username];
    query(account.permissions, params, qm.any)
        .then(result => resolve(result))
        .catch(error => reject(error));
  }),

  saveAccount: ({ username, password, email = null, name = null }) =>
        new Promise((resolve, reject) => {
          hashExpression(password)
              .then((hash) => {
                const params = [username, hash, email, name];
                return query(account.add, params, qm.one);
              })
              .then(user => resolve(user.username))
              .catch(error => reject(error));
        }),

  authenticateAccount: ({user, password}) => {
      return new Promise((resolve, reject) => {
          let params = [user];
          query(account.findOne, params, qm.one)
              .then(({username, hash}) => {

                  compareToHash(password, hash)
                      .then(({match}) => {
                          if (!match) return reject({authenticated: false})
                          let token = encode(username);
                          resolve(token);
                      })
                      .catch((error) => reject({error: error})); 

              })
              .catch(error => reject(error)); 
      })
  },

  findByQuery: (searchQuery) => {
      return new Promise((resolve, reject) => {
          let expression = '%' + searchQuery + '%';
          let params = [expression];
          query(account.findUsers, params, qm.any)
              .then(users => {
                  resolve(users)
              })
              .catch(error => {
                  console.log(error);
                  reject(error)
              });
      })
  }
    
}