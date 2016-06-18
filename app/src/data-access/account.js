import {singleQuery} from '../database/db';
import {hashExpression, compareToHash} from '../helpers/crypto';
import {encode} from '../helpers/jwt';

export default {
    
    saveAccount: ({username, password}) => {
        return new Promise((resolve, reject) => {
            hashExpression(password)
                .then(hash => {
                    let query = 'INSERT INTO account (username, hash) VALUES ($1, $2) RETURNING username';
                    let params = [username, hash];
                    return singleQuery(query, params);
                })
                .then(user => {
                    resolve(user.rows[0]);
                })
                .catch(error => {
                    reject(error);
                })
        });
    },
    
    authenticateAccount: ({user, password}) => {
        return new Promise((resolve, reject) => {
           let query = 'SELECT username, hash from account WHERE username=$1';
           let params = [user];
           singleQuery(query, params)
                .then(({rows}) => {
                    if (rows.length === 0) return reject({authenticated: false});
                    let {username, hash} = rows[0];
                    compareToHash(password, hash)
                        .then(({match}) => {
                            if (!match) return reject({authenticated: false})
                            let token = encode(username);
                            resolve(token);
                        })
                        .catch((error) => reject({error: error})); 
                })
                .catch(error => reject({error: error})); 
        })
    }
    
}