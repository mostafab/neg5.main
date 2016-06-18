'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.singleQuery = undefined;

var _pg = require('pg');

var _pg2 = _interopRequireDefault(_pg);

var _configuration = require('../config/configuration');

var _configuration2 = _interopRequireDefault(_configuration);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var env = _configuration2.default.env;
var databaseConnections = _configuration2.default.databaseConnections;

var connectionString = databaseConnections.postgres[env];

var singleQuery = exports.singleQuery = function singleQuery(text, params) {
    return new Promise(function (resolve, reject) {
        _pg2.default.connect(connectionString, function (err, client, done) {
            if (err) return reject(err);
            client.query({
                text: text,
                values: params
            }, function (err, result) {
                done();
                if (err) reject(err);
                resolve(result);
            });
        });
    });
};

var rollbackTransaction = function rollbackTransaction(client, done) {
    client.query('ROLLBACK', function (err) {
        return done(err);
    });
};