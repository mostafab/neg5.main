import pg from 'pg';
import pgp from 'pg-promise';
import configuration from '../config/configuration';

const {env, databaseConnections} = configuration;
const connectionString = databaseConnections.postgres[env];

// export let singleQuery = (text, params) => {
//     return new Promise((resolve, reject) => {
//         pg.connect(connectionString, (err, client, done) => {
//             if (err) return reject(err);
//             client.query({
//                 text: text,
//                 values: params
//             }, (err, result) => {
//                 done();
//                 if (err) return reject(err);
//                 resolve(result);
//             });
//         });
//     })
// }

export let queryTypeMap = {
    one: pgp.queryResult.one,
    many: pgp.queryResult.many,
    none: pgp.queryResult.none,
    any: pgp.queryResult.any
}

let pgPromise = pgp();

let db = pgPromise(connectionString);

export let promiseQuery = (text, params, queryType = pgp.queryResult.any) => {
    return new Promise((resolve, reject) => {
        db.query(text, params, queryType)
            .then(data => resolve(data))
            .catch(error => reject(error));
    })
}

export let transaction = (queries) => { 

    return new Promise((resolve, reject) => {
        db.tx(t => {

            let dbQueries = [];

            queries.forEach(({query, params, queryType = pgp.queryResult.any}) => {
                if (!query || !params) {
                    throw new Error("Invalid arguments passed. Both query and params are required in each query");
                } else {
                    dbQueries.push(
                        t.query(query, params, queryType)
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






