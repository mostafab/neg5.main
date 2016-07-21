'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.compareToHash = exports.hashExpression = undefined;

var _bcryptjs = require('bcryptjs');

var _bcryptjs2 = _interopRequireDefault(_bcryptjs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var SALT_WORK_FACTOR = 10;

var hashExpression = exports.hashExpression = function hashExpression(expression) {
    return new Promise(function (resolve, reject) {
        _bcryptjs2.default.genSalt(SALT_WORK_FACTOR, function (saltErr, salt) {
            if (saltErr) return reject(err);
            _bcryptjs2.default.hash(expression, salt, function (hashErr, hash) {
                if (hashErr) return reject(hashErr);
                resolve(hash);
            });
        });
    });
};

var compareToHash = exports.compareToHash = function compareToHash(expression, hash) {
    return new Promise(function (resolve, reject) {
        _bcryptjs2.default.compare(expression, hash, function (err, result) {
            if (err) return reject(err);
            resolve({ match: result });
        });
    });
};