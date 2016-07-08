'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
var hasToken = exports.hasToken = function hasToken(req, res, next) {
    if (req.body.jwt || req.query.jwt || req.cookies.jwt) {
        next();
    } else {
        return res.status(403).send({ message: 'This route requires authorization.', success: false });
    }
};

var isValidToken = exports.isValidToken = function isValidToken(req, res, next) {};