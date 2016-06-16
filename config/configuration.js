'use strict';

const fs = require('fs');
const path = require('path');

const configurationFilePath = path.join(__dirname, '../../configuration.json'); 

let buffer;
let configurationJson;

try {
    buffer = fs.readFileSync(configurationFilePath);
    configurationJson = JSON.parse(buffer);
} catch (err) {
    throw err;
}

module.exports = configurationJson;