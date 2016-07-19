import db from '../../data-access/account';

export default {
    
    create: ({username, password, email =  null, name =  null}) => {
        return new Promise((resolve, reject) => {
            let newAccount = {
                username,
                password,
                email,
                name
            };
            db.saveAccount(newAccount)
                .then(user => resolve(user))
                .catch(error => reject(error));
        }); 
    },
    
    findOne: ({username, password}) => {
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