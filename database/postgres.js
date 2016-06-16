const pg = require('pg');
const configuration = require('../config/configuration');

const connectionString = configuration.databaseConnections.postgres.local;

module.exports = new pg.Client(connectionString);
