'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _shortid = require('shortid');

var _shortid2 = _interopRequireDefault(_shortid);

var _db = require('../database/db');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {

    saveTournament: function saveTournament(tournamentInfo) {

        return new Promise(function (resolve, reject) {
            var name = tournamentInfo.name;
            var _tournamentInfo$date = tournamentInfo.date;
            var date = _tournamentInfo$date === undefined ? new Date() : _tournamentInfo$date;
            var _tournamentInfo$quest = tournamentInfo.questionSet;
            var questionSet = _tournamentInfo$quest === undefined ? '' : _tournamentInfo$quest;
            var _tournamentInfo$comme = tournamentInfo.comments;
            var comments = _tournamentInfo$comme === undefined ? '' : _tournamentInfo$comme;
            var _tournamentInfo$tossu = tournamentInfo.tossupScheme;
            var tossupScheme = _tournamentInfo$tossu === undefined ? [] : _tournamentInfo$tossu;


            var tournamentId = _shortid2.default.generate();

            var tournamentQuery = 'INSERT INTO tournament (id, name, tournament_date, question_set, comments, director_id) VALUES ($1, $2, $3, $4, $5, $6)';
            var tournamentParams = [tournamentId, name, date, questionSet, comments, 'mbadmin'];

            var _buildTournamentPoint = buildTournamentPointSchemeInsertQuery(tossupScheme, tournamentId);

            var tossupParams = _buildTournamentPoint.tossupParams;
            var tossupValues = _buildTournamentPoint.values;


            var tossupQuery = 'INSERT INTO tournament_tossup_values (tournament_id, tossup_value, tossup_answer_type) VALUES ' + tossupValues.join(', ');

            (0, _db.transaction)([{
                query: tournamentQuery,
                params: tournamentParams
            }, {
                query: tossupQuery,
                params: tossupParams
            }]).then(function (data) {
                resolve(tournamentId);
            }).catch(function (error) {
                console.log(error);
                reject(error);
            });
        });
    }

};


function buildTournamentPointSchemeInsertQuery(rows, tournamentId) {
    var tossupParams = [];
    var values = [];

    rows.forEach(function (row) {
        var currentRowValues = [];

        tossupParams.push(tournamentId);
        currentRowValues.push('$' + tossupParams.length);

        tossupParams.push(row.value);
        currentRowValues.push('$' + tossupParams.length);

        tossupParams.push(row.type);
        currentRowValues.push('$' + tossupParams.length);

        values.push('(' + currentRowValues.join(', ') + ')');
    });

    return {
        tossupParams: tossupParams,
        values: values
    };
}