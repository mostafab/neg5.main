process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const PORT_NUM = 1337;

const mongoose = require('./config/mongoose');
const express = require('./config/express');

const db = mongoose();
const app = express();

app.listen(PORT_NUM);

module.exports = app;
console.log(process.env.NODE_ENV  + ' server running at http://localhost:' + PORT_NUM);
