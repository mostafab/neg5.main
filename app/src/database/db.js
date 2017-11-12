import pgp from 'pg-promise';
import configuration from '../config/configuration';
import log from './../helpers/log';

const { OWN_NODE_ENV } = configuration;
const pgConnectionString = configuration[`PG_DB_URL_${OWN_NODE_ENV}`];

log.INFO('Postgres connection host: ' + pgConnectionString.split('@')[1]);

const pgPromise = pgp();

const db = pgPromise(pgConnectionString);

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






