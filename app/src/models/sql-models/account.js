import db from '../../data-access/account';

export default {
    
    createAccount: (username, password) => {
        return new Promise((resolve, reject) => {
            let newAccount = {
                username: username,
                password: password
            };
            db.saveAccount(newAccount)
                .then(user => resolve(user))
                .catch(error => reject(error));
        }); 
    },
    
    getAccount: (username, password) => {
        return new Promise((resolve, reject) => {
           let accountToRetrieve = {
               user: username,
               password: password
           };
           db.authenticateAccount(accountToRetrieve)
                .then(jwt => resolve(jwt))
                .catch(error => reject(error)); 
        });
    }
    
}