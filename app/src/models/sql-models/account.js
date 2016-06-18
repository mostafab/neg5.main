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
    
    retrieveAccount: (username, password) => {
        return new Promise((resolve, reject) => {
           let accountToRetrieve = {
               username: username,
               password: password
           };
           db.getAccount(accountToRetrieve)
                .then(user => resolve(user))
                .catch(error => reject(error)); 
        });
    }
    
}