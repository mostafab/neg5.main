import pgp from 'pg-promise';
import configuration from '../config/configuration';
import log from './../helpers/log';

const { OWN_NODE_ENV } = configuration;
const pgConnectionString = configuration[`PG_DB_URL_${OWN_NODE_ENV}`];
const pgConnectionStringReadOnly = configuration[`PG_DB_READ_ONLY_${OWN_NODE_ENV}`];

log.INFO('Postgres connection host: ' + pgConnectionString.split('@')[1]);
log.INFO('Readonly postgres connection host: ' + pgConnectionStringReadOnly.split('@')[1]);

const pgPromise = pgp();

const readWriteDb = pgPromise(pgConnectionString);
const readOnlyDb = pgPromise(pgConnectionStringReadOnly);

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

export const readOnlyQuery = (text, params, queryType = pgp.queryResult.any) =>
  new Promise((resolve, reject) => {
    readOnlyDb.query(text, params, queryType)
        .then(data => resolve(data))
        .catch((error) => {
          console.log(error);
          reject(error);
        });
  });

export const readOnlyTransaction = queries => new Promise((resolve, reject) => {
  readOnlyDb.tx((t) => {
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

export const query = (text, params, queryType = pgp.queryResult.any) =>
  new Promise((resolve, reject) => {
    readWriteDb.query(text, params, queryType)
        .then(data => resolve(data))
        .catch((error) => {
          console.log(error);
          reject(error);
        });
  });

export const transaction = queries => new Promise((resolve, reject) => {
  readWriteDb.tx((t) => {
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






