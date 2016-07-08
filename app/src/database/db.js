import pg from 'pg';
import pgp from 'pg-promise';
import configuration from '../config/configuration';

const {env, databaseConnections} = configuration;
const connectionString = databaseConnections.postgres[env];

export let singleQuery = (text, params) => {
    return new Promise((resolve, reject) => {
        pg.connect(connectionString, (err, client, done) => {
            if (err) return reject(err);
            client.query({
                text: text,
                values: params
            }, (err, result) => {
                done();
                if (err) return reject(err);
                resolve(result);
            });
        });
    })
}

let pgPromise = pgp();

let db = pgPromise(connectionString);

export let promiseQuery = (text, params) => {
    return new Promise((resolve, reject) => {
        db.one(text, params)
            .then(data => resolve(data))
            .catch(error => reject(error));
    })
}

export let transaction = (queries) => {
    

    return new Promise((resolve, reject) => {
        db.tx(t => {

            let dbQueries = [];

            queries.forEach(({query, params}) => {
                if (!query || !params) {
                    throw new Error("Invalid arguments passed");
                } else {
                    dbQueries.push(
                        t.none(query, params)
                    )   
                }
                
            });

            return t.batch(
                dbQueries
            )

        })
        .then(data => resolve(data))
        .catch(error => reject(error));
    })
    
}






