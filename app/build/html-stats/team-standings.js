'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _stats = require('./../data-access/stats');

var _stats2 = _interopRequireDefault(_stats);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (tournamentId) {
    var phaseId = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];
    return new Promise(function (resolve, reject) {

        var teamStandingsPromise = _stats2.default.teamReport(tournamentId, phaseId);

        teamStandingsPromise.then(function (results) {
            var pointScheme = results.pointScheme;
            var stats = results.stats;
            var divisions = results.divisions;


            resolve(buildHtmlString(stats, divisions, pointScheme));
        });
    });
};

function buildHtmlString(stats, divisions, pointScheme) {
    var reportHtmlString = '<HTML>';

    reportHtmlString += '</HTML>';

    return reportHtmlString;
}