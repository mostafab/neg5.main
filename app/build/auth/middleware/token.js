'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.hasToken = undefined;

var _jwt = require('./../../helpers/jwt');

var hasToken = exports.hasToken = function hasToken(req, res, next) {
  var jwt = req.body.token || req.query.token || req.cookies.nfToken;
  if (jwt) {
    try {
      req.currentUser = (0, _jwt.decode)(jwt);
      return next();
    } catch (error) {
      return res.status(403).send({ message: 'Invalid token: ' + jwt, success: false });
    }
  } else {
    return res.status(403).send({ message: 'This route requires authorization.', success: false });
  }
};