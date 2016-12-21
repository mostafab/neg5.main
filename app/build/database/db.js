'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.transaction = exports.query = exports.txMap = exports.queryTypeMap = undefined;

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

var txMap = exports.txMap = {
  one: 'one',
  many: 'many',
  none: 'none',
  any: 'any'
};

var query = exports.query = function query(text, params) {
  var queryType = arguments.length <= 2 || arguments[2] === undefined ? _pgPromise2.default.queryResult.any : arguments[2];
  return new Promise(function (resolve, reject) {
    db.query(text, params, queryType).then(function (data) {
      return resolve(data);
    }).catch(function (error) {
      console.log(error);
      reject(error);
    });
  });
};

var transaction = exports.transaction = function transaction(queries) {
  return new Promise(function (resolve, reject) {
    db.tx(function (t) {
      var formattedQueries = [];
      queries.forEach(function (_ref) {
        var text = _ref.text;
        var params = _ref.params;
        var queryType = _ref.queryType;

        formattedQueries.push(t[queryType](text, params));
      });
      return t.batch(formattedQueries);
    }).then(function (data) {
      return resolve(data);
    }).catch(function (error) {
      console.log('ERROR: ', error.message || error);
      reject(error);
    });
  });
};