'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (url) {
    return new Promise(function (resolve, reject) {
        (0, _request2.default)(url, function (error, response, body) {
            if (error) {
                console.log(error);
                reject(error);
            } else {
                resolve(body);
            }
        });
    });
};