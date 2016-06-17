import config from './config/configuration';
import express from './config/express';

const mongoose = require('./config/mongoose');

const postgres = require('./database/postgres');

const db = mongoose();
const app = express();

const PORT_NUM = config.port;

app.listen(PORT_NUM);

module.exports = app;

console.log('Server running at http://localhost:' + PORT_NUM);
