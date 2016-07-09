'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _pgPromise = require('pg-promise');

var _pgPromise2 = _interopRequireDefault(_pgPromise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var QueryFile = _pgPromise2.default.QueryFile;

var getSQL = function getSQL(file) {
    var relativePath = './../sql/';
    return new QueryFile(relativePath + file, { minify: true });
};

exports.default = {
    tournament: {
        add: getSQL('tournament-sql/createTournament.sql')
    }
};