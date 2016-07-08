import {singleQuery, promiseQuery} from '../database/db';
import {hashExpression, compareToHash} from '../helpers/crypto';
import {encode} from '../helpers/jwt';

export default {
    
    saveAccount: ({username, password}) => {
        return new Promise((resolve, reject) => {
            hashExpression(password)
                .then(hash => {
                    let insertQuery = 'INSERT INTO account (username, hash) VALUES ($1, $2) RETURNING username';
                    let params = [username, hash];
                    return promiseQuery(insertQuery, params);
                })
                .then(user => {
                    resolve(user.username);
                })
                .catch(error => {
                    console.log(error);
                    reject(error);
                })
        });
    },
    
    authenticateAccount: ({user, password}) => {
        return new Promise((resolve, reject) => {
           let selectQuery = 'SELECT username, hash from account WHERE username=$1 LIMIT 1';
           let params = [user];
           promiseQuery(selectQuery, params)
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
    }
    
}