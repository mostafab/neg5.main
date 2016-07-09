'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.query = exports.queryTypeMap = undefined;

var _pgPromise = require('pg-promise');

var _pgPromise2 = _interopRequireDefault(_pgPromise);

var _configuration = require('../config/configuration');

var _configuration2 = _interopRequireDefault(_configuration);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var env = _configuration2.default.env;
var databaseConnections = _configuration2.default.databaseConnections;

var connectionString = databaseConnections.postgres[env];

var pgPromise = (0, _pgPromise2.default)();

var db = pgPromise(connectionString);

var queryTypeMap = exports.queryTypeMap = {
    one: _pgPromise2.default.queryResult.one,
    many: _pgPromise2.default.queryResult.many,
    none: _pgPromise2.default.queryResult.none,
    any: _pgPromise2.default.queryResult.any
};

var query = exports.query = function query(text, params) {
    var queryType = arguments.length <= 2 || arguments[2] === undefined ? _pgPromise2.default.queryResult.any : arguments[2];

    return new Promise(function (resolve, reject) {
        db.query(text, params, queryType).then(function (data) {
            return resolve(data);
        }).catch(function (error) {
            console.log(error.toString());
            reject(error);
        });
    });
};

// export let promiseQuery = (text, params, queryType = pgp.queryResult.any) => {
//     return new Promise((resolve, reject) => {
//         db.query(text, params, queryType)
//             .then(data => resolve(data))
//             .catch(error => reject(error));
//     })
// }

// export let transaction = (queries) => {

//     return new Promise((resolve, reject) => {
//         db.tx(t => {

//             let dbQueries = [];

//             queries.forEach(({query, params, queryType = pgp.queryResult.any}) => {
//                 if (!query || !params) {
//                     throw new Error("Invalid arguments passed. Both query and params are required in each query");
//                 } else {
//                     dbQueries.push(
//                         t.query(query, params, queryType)
//                     )  
//                 }

//             });

//             return t.batch(
//                 dbQueries
//             )

//         })
//         .then(data => resolve(data))
//         .catch(error => reject(error));
//     })

// }