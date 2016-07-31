import http from 'http';
import config from './config/configuration';
import express from './config/express';

const mongoose = require('./config/mongoose');

const PORT_NUM = config.port;

const db = mongoose();
const app = express();

const server = http.createServer(app).listen(PORT_NUM);

console.log('Express server running on port ' + PORT_NUM);

module.exports = server;
