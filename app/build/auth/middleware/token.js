'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.hasToken = undefined;

var _jwt = require('./../../helpers/jwt');

/* eslint-disable no-param-reassign */
var hasToken = exports.hasToken = function hasToken(req, res, next) {
  var jwt = req.body.token || req.query.token || req.cookies.nfToken;
  if (jwt) {
    try {
      var user = (0, _jwt.decode)(jwt).username;
      if (!user) {
        return res.status(403).send({ message: 'Invalid token: ' + jwt });
      }
      req.currentUser = user;
      return next();
    } catch (error) {
      return res.status(403).send({ message: 'Invalid token: ' + jwt, success: false });
    }
  } else {
    return res.status(403).send({ message: 'This route requires authorization.', success: false });
  }
};