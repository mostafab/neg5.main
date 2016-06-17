import pg from 'pg';
import configuration from '../config/configuration';

const connectionString = configuration.databaseConnections.postgres.local;

module.exports = new pg.Client(connectionString);
