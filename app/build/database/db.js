'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.transaction = exports.promiseQuery = exports.queryTypeMap = undefined;

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

// export let singleQuery = (text, params) => {
//     return new Promise((resolve, reject) => {
//         pg.connect(connectionString, (err, client, done) => {
//             if (err) return reject(err);
//             client.query({
//                 text: text,
//                 values: params
//             }, (err, result) => {
//                 done();
//                 if (err) return reject(err);
//                 resolve(result);
//             });
//         });
//     })
// }

var queryTypeMap = exports.queryTypeMap = {
    one: _pgPromise2.default.queryResult.one,
    many: _pgPromise2.default.queryResult.many,
    none: _pgPromise2.default.queryResult.none,
    any: _pgPromise2.default.queryResult.any
};

var pgPromise = (0, _pgPromise2.default)();

var db = pgPromise(connectionString);

var promiseQuery = exports.promiseQuery = function promiseQuery(text, params) {
    var queryType = arguments.length <= 2 || arguments[2] === undefined ? _pgPromise2.default.queryResult.any : arguments[2];

    return new Promise(function (resolve, reject) {
        db.query(text, params, queryType).then(function (data) {
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
                var _ref$queryType = _ref.queryType;
                var queryType = _ref$queryType === undefined ? _pgPromise2.default.queryResult.any : _ref$queryType;

                if (!query || !params) {
                    throw new Error("Invalid arguments passed. Both query and params are required in each query");
                } else {
                    dbQueries.push(t.query(query, params, queryType));
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