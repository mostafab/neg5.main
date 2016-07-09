import {hashExpression, compareToHash} from '../helpers/crypto';
import {encode} from '../helpers/jwt';

import {query, queryTypeMap as qm} from '../database/db';
import sql from '../database/sql';

const account = sql.account;

export default {
    
    saveAccount: ({username, password}) => {
        return new Promise((resolve, reject) => {
            hashExpression(password)
                .then(hash => {

                    let params = [username, hash];
                    return query(account.add, params, qm.one);
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
    }
    
}