import {singleQuery} from '../database/db';
import {hashExpression, compareToHash} from '../helpers/crypto';

export default {
    
    saveAccount: ({username, password}) => {
        return new Promise((resolve, reject) => {
            hashExpression(password)
                .then(hash => {
                    let query = 'INSERT INTO account (username, hash) VALUES ($1, $2) RETURNING *';
                    let params = [username, hash];
                    return singleQuery(query, params);
                })
                .then(user => {
                    resolve(user);
                })
                .catch(error => {
                    reject(error);
                })
        });
    },
    
    getAccount: ({username, password}) => {
        
    }
    
}