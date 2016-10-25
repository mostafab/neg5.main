'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _stats = require('./../data-access/stats');

var _stats2 = _interopRequireDefault(_stats);

var _htmlUtils = require('./html-utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

exports.default = function (tournamentId) {
    var phaseId = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];
    return new Promise(function (resolve, reject) {

        var playerStatsPromise = _stats2.default.individualReport(tournamentId, phaseId);

        playerStatsPromise.then(function (results) {
            var pointScheme = results.pointScheme;
            var stats = results.stats;
            var tournamentName = results.tournamentName;
            var phase = results.phase;

            resolve(buildHtmlString(tournamentName, stats, pointScheme, phase));
        }).catch(function (error) {
            return reject(error);
        });
    });
};

function buildHtmlString(tournamentName, stats, pointScheme, phase) {
    var reportHtmlString = '<HTML>\n                <HEAD>\n                    <TITLE> ' + tournamentName + ' Individual Statistics - ' + phase.name + ' </TITLE>\n                </HEAD>\n                <BODY>';

    reportHtmlString += (0, _htmlUtils.statsNavigationBarHtml)(tournamentName);
    reportHtmlString += '<H1>' + tournamentName + ' Individual Statistics - ' + phase.name + '</H1>';
    reportHtmlString += buildPlayersTable(stats, pointScheme, tournamentName);

    reportHtmlString += '</BODY></HTML>';

    return reportHtmlString;
}

function buildPlayersTable(playerStats, pointScheme, tournamentName) {
    var orderedPoints = pointScheme.sort(function (first, second) {
        return second.value - first.value;
    }).map(function (tv) {
        return tv.value;
    });

    var htmlString = '<table border=1 width=100%>';
    htmlString += _htmlUtils.buildTableHeader.apply(undefined, [{ name: 'Rank', left: true }, { name: 'Player', left: true }, { name: 'Team', left: true }, { name: 'GP', left: false }].concat(_toConsumableArray(orderedPoints.map(function (p) {
        return { name: p, left: false };
    })), [{ name: 'TUH', left: false }, { name: 'P/TU', left: false }, { name: 'Pts', left: false }, { name: 'PPG', left: false }]));

    var normalizedTournamentName = tournamentName.toLowerCase().replace(/ /g, '_');

    playerStats.forEach(function (player, index) {
        return htmlString += buildSinglePlayerRow(player, orderedPoints, index + 1, normalizedTournamentName);
    });

    htmlString += '</table>';

    return htmlString;
}

function buildSinglePlayerRow(player, tossupValues, rank, tournamentName) {
    var playerTossupTotals = player.tossup_totals.reduce(function (aggr, current) {
        aggr[current.value] = current.total;
        return aggr;
    }, {});

    var htmlString = '<tr>\n        <td ALIGN=LEFT>' + rank + '</td>\n        <td ALIGN=LEFT>\n            <A HREF=' + tournamentName + '_playerdetail.html#' + player.player_id + '>' + player.player_name + '</A>\n        </td>\n        <td ALIGN=LEFT>' + player.team_name + '</td>\n        <td ALIGN=RIGHT>' + player.games_played + '</td>\n        ';
    tossupValues.forEach(function (tv) {
        return htmlString += '<td ALIGN=RIGHT>' + (playerTossupTotals[tv] || 0) + ' </td>';
    });

    htmlString += '\n        <td ALIGN=RIGHT>' + player.total_player_tuh + '</td>\n        <td ALIGN=RIGHT>' + player.points_per_tossup + '</td>\n        <td ALIGN=RIGHT>' + player.total_points + '</td>\n        <td ALIGN=RIGHT>' + player.points_per_game + '</td>';

    htmlString += '</tr>';

    return htmlString;
}