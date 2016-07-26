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

export let txMap = {
    one: 'one',
    many: 'many',
    none: 'none',
    any: 'any'
}

export let query = (text, params, queryType = pgp.queryResult.any) => {
    return new Promise((resolve, reject) => {
        db.query(text, params, queryType)
            .then(data => resolve(data))
            .catch(error => {
                console.log(error);
                reject(error);            
            });
    });
}

export let transaction = (queries) => {
    return new Promise((resolve, reject) => {
        db.tx(t => {
            let formattedQueries = [];
            queries.forEach(({text, params, queryType}) => {
                // console.log(queryType);
                formattedQueries.push(
                    t[queryType](text, params)
                )
            });
            return t.batch(formattedQueries);
        })
        .then(data => resolve(data))
        .catch(error => {
            console.log('ERROR: ', error.message || error);
            reject(error);
        });
    });
}






