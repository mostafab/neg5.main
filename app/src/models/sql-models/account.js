import db from '../../data-access/account';

export default {

  create: ({ username, password, email = null, name = null }) => new Promise((resolve, reject) => {
    const newAccount = {
      username: username.trim().toLowerCase(),
      password: password.trim(),
      email: (!email || email.trim() === '') ? null : email.trim().toLowerCase(),
      name: (!name || name.trim() === '') ? null : name.trim(),
    };
    db.saveAccount(newAccount)
        .then(user => resolve(user))
        .catch(error => reject(error));
  }),

  findOne: ({ username, password }) => new Promise((resolve, reject) => {
    const accountToRetrieve = {
      user: username.trim().toLowerCase(),
      password: password.trim(),
    };
    db.authenticateAccount(accountToRetrieve)
        .then(jwt => resolve(jwt))
        .catch(error => reject(error));
  }),

  findByQuery: query => new Promise((resolve, reject) => {
    if (!query) {
      reject(new Error('No query provided'));
    }
    const searchQuery = query.trim().toLowerCase();
    db.findByQuery(searchQuery)
        .then(users => resolve(users))
        .catch(error => reject(error));
  }),

};
