import pgp from 'pg-promise';
import configuration from '../config/configuration';

const { env, databaseConnections } = configuration;
const connectionString = databaseConnections.postgres[env];

const pgPromise = pgp();

const db = pgPromise(connectionString);

export const queryTypeMap = {
  one: pgp.queryResult.one,
  many: pgp.queryResult.many,
  none: pgp.queryResult.none,
  any: pgp.queryResult.any,
};

export const txMap = {
  one: 'one',
  many: 'many',
  none: 'none',
  any: 'any',
};

export const query = (text, params, queryType = pgp.queryResult.any) =>
  new Promise((resolve, reject) => {
    db.query(text, params, queryType)
        .then(data => resolve(data))
        .catch((error) => {
          console.log(error);
          reject(error);
        });
  });

export const transaction = queries => new Promise((resolve, reject) => {
  db.tx((t) => {
    const formattedQueries = [];
    queries.forEach(({ text, params, queryType }) => {
      formattedQueries.push(
          t[queryType](text, params)
      );
    });
    return t.batch(formattedQueries);
  })
  .then(data => resolve(data))
  .catch((error) => {
    console.log('ERROR: ', error.message || error);
    reject(error);
  });
});






