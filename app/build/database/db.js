'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.transaction = exports.promiseQuery = exports.singleQuery = undefined;

var _pg = require('pg');

var _pg2 = _interopRequireDefault(_pg);

var _pgPromise = require('pg-promise');

var _pgPromise2 = _interopRequireDefault(_pgPromise);

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
                if (err) return reject(err);
                resolve(result);
            });
        });
    });
};

var pgPromise = (0, _pgPromise2.default)();

var db = pgPromise(connectionString);

var promiseQuery = exports.promiseQuery = function promiseQuery(text, params) {
    return new Promise(function (resolve, reject) {
        db.one(text, params).then(function (data) {
            return resolve(data);
        }).catch(function (error) {
            return reject(error);
        });
    });
};

var transaction = exports.transaction = function transaction(queries) {

    return new Promise(function (resolve, reject) {
        db.tx(function (t) {

            var dbQueries = [];

            queries.forEach(function (_ref) {
                var query = _ref.query;
                var params = _ref.params;

                if (!query || !params) {
                    throw new Error("Invalid arguments passed");
                } else {
                    dbQueries.push(t.none(query, params));
                }
            });

            return t.batch(dbQueries);
        }).then(function (data) {
            return resolve(data);
        }).catch(function (error) {
            return reject(error);
        });
    });
};