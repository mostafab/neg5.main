'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _tournament = require('./../../data-access/tournament');

var _tournament2 = _interopRequireDefault(_tournament);

var _team = require('./../../data-access/team');

var _team2 = _interopRequireDefault(_team);

var _match = require('./../../data-access/match');

var _match2 = _interopRequireDefault(_match);

var _stringFunctions = require('./../../helpers/string-functions');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var versionNumber = "1.2";
var highestAllowedDifference = 1;

exports.default = {

    createQBJObject: function createQBJObject(tournamentId, currentUser) {
        return new Promise(function (resolve, reject) {
            var qbjObj = {
                version: versionNumber,
                objects: []
            };
            Promise.all([_team2.default.getTeamsByTournament(tournamentId), _tournament2.default.findTournamentById(tournamentId, currentUser), _match2.default.findById(tournamentId, null, true)]).then(function (results) {
                var _qbjObj$objects, _qbjObj$objects2;

                var _results = _slicedToArray(results, 3);

                var teams = _results[0];
                var tournament = _results[1];
                var matches = _results[2];


                var tournamentQbj = tournamentQbjFactory(tournament.tournament);
                var registrations = registrationsArrayFactory(teams);
                var matchObjects = matchQbjArrayFactory(matches);

                tournamentQbj.registrations = registrations.map(function (r) {
                    return { $ref: r.id };
                });
                tournamentQbj.phases = [{
                    name: 'All Matches',
                    rounds: separateMatchesByRound(matches)
                }];

                qbjObj.objects.push(tournamentQbj);
                (_qbjObj$objects = qbjObj.objects).push.apply(_qbjObj$objects, _toConsumableArray(registrations));
                (_qbjObj$objects2 = qbjObj.objects).push.apply(_qbjObj$objects2, _toConsumableArray(matchObjects));

                resolve(qbjObj);
            }).catch(function (error) {
                return reject(error);
            });
        });
    }
};


function tournamentQbjFactory(tournament) {
    return {
        name: tournament.name,
        question_set: tournament.question_set,
        info: tournament.comments,
        tournament_site: {
            name: tournament.location
        },
        scoring_rules: {
            teams_per_match: 2,
            maximum_players_per_team: tournament.max_active_players_per_team,
            maximum_bonus_score: tournament.bonus_point_value * tournament.parts_per_bonus,
            bonus_divisor: tournament.bonus_point_value,
            bonuses_bounce_back: tournament.bouncebacks || false,
            answer_types: tournament.tossup_point_scheme.map(function (tv) {
                return {
                    value: tv.value,
                    awards_bonus: tv.type !== 'Neg'
                };
            })
        },
        type: 'Tournament'
    };
}

function registrationsArrayFactory(teams) {
    var registrations = [];
    var seenTeams = {};

    var groupedTeams = teams.reduce(function (aggregate, currentTeam) {
        if (!seenTeams[currentTeam.team_id]) {
            var matchingTeams = teams.filter(function (t) {
                return (0, _stringFunctions.levenshteinDistance)(currentTeam.name.toLowerCase(), t.name.toLowerCase()) <= highestAllowedDifference;
            });
            matchingTeams.forEach(function (t) {
                return seenTeams[t.team_id] = true;
            });

            var teamName = void 0;
            if (matchingTeams.length > 1) {
                teamName = (0, _stringFunctions.longestCommonSubsequence)(matchingTeams[0].name, matchingTeams[1].name).trim();
            } else {
                teamName = currentTeam.name;
            }
            var formattedTeams = matchingTeams.map(teamQbjFactory);
            aggregate[teamName] = formattedTeams;
        }

        return aggregate;
    }, {});

    for (var team in groupedTeams) {
        if (groupedTeams.hasOwnProperty(team)) {
            registrations.push({
                name: team,
                teams: groupedTeams[team],
                id: 'school_' + team,
                type: 'Registration'
            });
        }
    }

    return registrations;
}

function teamQbjFactory(_ref) {
    var name = _ref.name;
    var team_id = _ref.team_id;
    var players = _ref.players;

    return {
        name: name,
        id: 'team_' + team_id,
        players: players ? players.map(function (p) {
            return {
                name: p.player_name,
                id: 'player_' + p.player_id
            };
        }) : []
    };
}

function matchQbjArrayFactory(matches) {
    var formattedMatches = matches.map(function (match) {
        return {
            id: 'game_' + match.match_id,
            type: 'Match',
            tossups_read: match.tossups_heard,
            overtime_tossups_read: match.teams.reduce(function (sum, t) {
                return sum + t.overtime_tossups;
            }, 0),
            location: match.room,
            moderator: match.moderator,
            notes: match.notes,
            match_teams: match.teams.map(function (t) {
                return {
                    team: {
                        $ref: 'team_' + t.team_id
                    },
                    points: t.score,
                    bonus_bounceback_points: t.bounceback_points,
                    match_players: t.players.map(function (p) {
                        return {
                            player: {
                                $ref: 'player_' + p.player_id,
                                tossups_heard: p.tossups_heard,
                                answer_counts: p.tossup_values.map(function (tv) {
                                    return {
                                        answer_type: {
                                            value: tv.value
                                        },
                                        number: tv.number
                                    };
                                })
                            }
                        };
                    })
                };
            })
        };
    });

    return formattedMatches;
}

function separateMatchesByRound(matches) {
    var separatedRounds = matches.reduce(function (aggr, current) {
        var round = current.round;

        round = round || 0;
        if (!aggr[round]) {
            aggr[round] = [];
        }
        aggr[round].push(current);
        return aggr;
    }, {});

    var rounds = [];
    for (var roundNumber in separatedRounds) {
        if (separatedRounds.hasOwnProperty(roundNumber)) {
            rounds.push({
                name: 'Round ' + roundNumber,
                matches: separatedRounds[roundNumber].map(function (m) {
                    return { $ref: 'game_' + m.match_id };
                })
            });
        }
    }

    return rounds;
}