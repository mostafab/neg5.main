'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
var statsNavigationBarHtml = exports.statsNavigationBarHtml = function statsNavigationBarHtml(tournamentName) {
    var normalizedTournamentName = tournamentName.toLowerCase().replace(/ /g, '_');
    return '\n        <table border=0 width=100%>\n            <tr>\n            <td><A HREF=' + normalizedTournamentName + '_standings.html>Standings</A></td>\n            <td><A HREF=' + normalizedTournamentName + '_individuals.html>Individuals</A></td>\n            <td><A HREF=' + normalizedTournamentName + '_games.html>Scoreboard</A></td>\n            <td><A HREF=' + normalizedTournamentName + '_teamdetail.html>Team Detail</A></td>\n            <td><A HREF=' + normalizedTournamentName + '_playerdetail.html>Individual Detail</A></td>\n            <td><A HREF=' + normalizedTournamentName + '_rounds.html>Round Report</A></td>\n            </tr>\n            </table>\n    ';
};

var buildTableHeader = exports.buildTableHeader = function buildTableHeader() {
    for (var _len = arguments.length, columnNames = Array(_len), _key = 0; _key < _len; _key++) {
        columnNames[_key] = arguments[_key];
    }

    var tableString = '<tr>';
    columnNames.forEach(function (column) {
        return tableString += '<td ALIGN=' + (column.left ? 'LEFT' : 'RIGHT') + '><B>' + column.name + '</B></td>';
    });

    tableString += '</tr>';
    return tableString;
};