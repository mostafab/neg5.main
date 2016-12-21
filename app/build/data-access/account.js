'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _crypto = require('../helpers/crypto');

var _jwt = require('../helpers/jwt');

var _db = require('../database/db');

var _sql = require('../database/sql');

var _sql2 = _interopRequireDefault(_sql);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var accountSQL = _sql2.default.account;

exports.default = {
  getUserPermissions: function getUserPermissions(username, tournamentId) {
    return new Promise(function (resolve, reject) {
      var params = [tournamentId, username];
      (0, _db.query)(accountSQL.permissions, params, _db.queryTypeMap.any).then(function (result) {
        return resolve(result);
      }).catch(function (error) {
        return reject(error);
      });
    });
  },

  saveAccount: function saveAccount(_ref) {
    var username = _ref.username;
    var password = _ref.password;
    var _ref$email = _ref.email;
    var email = _ref$email === undefined ? null : _ref$email;
    var _ref$name = _ref.name;
    var name = _ref$name === undefined ? null : _ref$name;
    return new Promise(function (resolve, reject) {
      (0, _crypto.hashExpression)(password).then(function (hash) {
        var params = [username, hash, email, name];
        return (0, _db.query)(accountSQL.add, params, _db.queryTypeMap.one);
      }).then(function (user) {
        return resolve(user.username);
      }).catch(function (error) {
        return reject(error);
      });
    });
  },

  authenticateAccount: function authenticateAccount(_ref2) {
    var user = _ref2.user;
    var password = _ref2.password;
    return new Promise(function (resolve, reject) {
      var params = [user];
      var retrievedUsername = null;
      (0, _db.query)(accountSQL.findOne, params, _db.queryTypeMap.one).then(function (_ref3) {
        var username = _ref3.username;
        var hash = _ref3.hash;

        retrievedUsername = username;
        return (0, _crypto.compareToHash)(password, hash);
      }).then(function (_ref4) {
        var match = _ref4.match;

        if (!match) return reject({ authenticated: false });
        var token = (0, _jwt.encode)(retrievedUsername);
        return resolve(token);
      }).catch(function (error) {
        return reject(error);
      });
    });
  },

  findByQuery: function findByQuery(searchQuery) {
    return new Promise(function (resolve, reject) {
      var expression = '%' + searchQuery + '%';
      var params = [expression];
      (0, _db.query)(accountSQL.findUsers, params, _db.queryTypeMap.any).then(function (users) {
        return resolve(users);
      }).catch(function (error) {
        return reject(error);
      });
    });
  }
};