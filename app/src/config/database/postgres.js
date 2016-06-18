import pg from 'pg';
import configuration from '../configuration';

const connectionString = configuration.databaseConnections.postgres.local;

module.exports = new pg.Client(connectionString);
