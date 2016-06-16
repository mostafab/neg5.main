const config = require('./config/configuration');
const mongoose = require('./config/mongoose');
const express = require('./config/express');

const postgres = require('./database/postgres');

const db = mongoose();
const app = express();

var PORT_NUM = config.port;

app.listen(PORT_NUM);

module.exports = app;

console.log('Server running at http://localhost:' + PORT_NUM);
