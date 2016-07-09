import pgp from 'pg-promise';
import configuration from '../config/configuration';

const {env, databaseConnections} = configuration;
const connectionString = databaseConnections.postgres[env];

let pgPromise = pgp();

let db = pgPromise(connectionString);

export let queryTypeMap = {
    one: pgp.queryResult.one,
    many: pgp.queryResult.many,
    none: pgp.queryResult.none,
    any: pgp.queryResult.any
}

export let query = (text, params, queryType = pgp.queryResult.any) => {
    return new Promise((resolve, reject) => {
        db.query(text, params, queryType)
            .then(data => resolve(data))
            .catch(error => {
                console.log(error.toString());
                reject(error)
            });
    });
}

// export let promiseQuery = (text, params, queryType = pgp.queryResult.any) => {
//     return new Promise((resolve, reject) => {
//         db.query(text, params, queryType)
//             .then(data => resolve(data))
//             .catch(error => reject(error));
//     })
// }

// export let transaction = (queries) => { 

//     return new Promise((resolve, reject) => {
//         db.tx(t => {

//             let dbQueries = [];

//             queries.forEach(({query, params, queryType = pgp.queryResult.any}) => {
//                 if (!query || !params) {
//                     throw new Error("Invalid arguments passed. Both query and params are required in each query");
//                 } else {
//                     dbQueries.push(
//                         t.query(query, params, queryType)
//                     )   
//                 }
                
//             });

//             return t.batch(
//                 dbQueries
//             )

//         })
//         .then(data => resolve(data))
//         .catch(error => reject(error));
//     })
    
// }






