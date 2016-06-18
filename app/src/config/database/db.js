import pg from 'pg';
import configuration from '../configuration';

const {env, databaseConnections} = configuration;
const connectionString = databaseConnections.postgres[env];

export let singleQuery = (text, params) => {
    return new Promise((resolve, reject) => {
        pg.connect(connectionString, (err, client, done) => {
            if (err) return reject(err);
            client.query(text, params, (err, result) => {
                console.log(err);
                done();
                if (err) return reject(err);
                resolve(result);                
            })
        });
    })
}

let rollbackTransaction = (client, done) => {
    client.query('ROLLBACK', (err) => {
        return done(err);
    })
}






