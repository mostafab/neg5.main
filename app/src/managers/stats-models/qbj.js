'use strict';

import tournamentDB from './../../data-access/tournament';
import teamDB from './../../data-access/team';
import matchDB from './../../data-access/match';
import {levenshteinDistance, longestCommonSubsequence} from './../../helpers/string-functions';

const versionNumber = "1.2";
const highestAllowedDifference = 1;

export default {
    /**
     * This needs to be changed to not be blocking the event loop.
     */
    createQBJObject: (tournamentId, currentUser = null) => {
        return new Promise((resolve, reject) => {
            const qbjObj = {
                version: versionNumber,
                objects: []
            };
            matchDB.getMatchesByTournament(tournamentId)
                .then(matches => {
                    const matchPromises = createMatchPromises(tournamentId, matches);
                    Promise.all(
                        [
                            teamDB.getTeamsByTournament(tournamentId), 
                            tournamentDB.findTournamentById(tournamentId, currentUser, false),
                            ...matchPromises
                        ])
                        .then(results => {
                            const [teams, tournament, ...matches] = results;
                            
                            const tournamentQbj = tournamentQbjFactory(tournament.tournament);
                            const registrations = registrationsArrayFactory(teams);
                            const matchObjects = matchQbjArrayFactory(matches);
                            
                            tournamentQbj.registrations = registrations.map(r => {
                                return {
                                    $ref: r.id
                                }
                            })
                            tournamentQbj.phases = [
                                {
                                    name: 'All Matches',
                                    rounds: separateMatchesByRound(matches)
                                }
                            ]
                            
                            qbjObj.objects.push(tournamentQbj);
                            qbjObj.objects.push(...registrations);
                            qbjObj.objects.push(...matchObjects);
                            
                            resolve(qbjObj);
                        })
                        .catch(err => reject(err))
                })
                .catch(error => reject(error));
        })
    }
}

function createMatchPromises(tournamentId, matches) {
    return matches.map(m => matchDB.findById(tournamentId, m.match_id))
}

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
            answer_types: tournament.tossup_point_scheme.map(tv => {
                return {
                    value: tv.value,
                    awards_bonus: tv.type !== 'Neg'
                }
            })  
        },
        type: 'Tournament'
    }
}

function registrationsArrayFactory(teams) {
    const registrations = [];
    const seenTeams = {};
    
    let groupedTeams = teams.reduce((aggregate, currentTeam) => {
        if (!seenTeams[currentTeam.team_id]) {
            const matchingTeams = teams.filter(t => {
                return levenshteinDistance(currentTeam.name.toLowerCase(), t.name.toLowerCase()) <= highestAllowedDifference;
            });
            matchingTeams.forEach(t => seenTeams[t.team_id] = true);
            
            let teamName;
            if (matchingTeams.length > 1) {
                teamName = longestCommonSubsequence(matchingTeams[0].name, matchingTeams[1].name).trim(); 
            } else {    
                teamName = currentTeam.name;
            }
            const formattedTeams = matchingTeams.map(teamQbjFactory);
            aggregate[teamName] = formattedTeams;
        }
        
        return aggregate;
    }, {});
    
    for (const team in groupedTeams) {
        if (groupedTeams.hasOwnProperty(team)) {
            registrations.push({
                name: team,
                teams: groupedTeams[team],
                id: 'school_' + team,
                type: 'Registration'
            })
        }
    }
    
    return registrations;
}

function teamQbjFactory({name, team_id, players}) {
    return {
        name,
        id: 'team_' + team_id,
        players: players ? players.map(p => {
            return {
                name: p.player_name,
                id: 'player_' + p.player_id
            }
        }) : []
    }
}

function matchQbjArrayFactory(matches) {
    const formattedMatches = matches.map(match => {
        return {
            id: 'game_' + match.match_id,
            type: 'Match',
            tossups_read: match.tossups_heard,
            overtime_tossups_read: match.teams.reduce((sum, t) => sum + t.overtime_tossups, 0),
            location: match.room,
            moderator: match.moderator,
            notes: match.notes,
            serial: match.serial_id,
            match_teams: match.teams.map(t => {
                return {
                    team: {
                        $ref: 'team_' + t.team_id
                    },
                    points: t.score,
                    bonus_bounceback_points: t.bounceback_points,
                    match_players: t.players.map(p => {
                        return {
                            player: {
                                $ref: 'player_' + p.player_id
                            },
                            tossups_heard: p.tossups_heard,
                            answer_counts: p.tossup_values.map(tv => {
                                return {
                                    answer_type: {
                                        value: tv.value
                                    },
                                    number: tv.number
                                }
                            })
                        }
                    })
                }
            })
        }
    });
    
    return formattedMatches;
}

function separateMatchesByRound(matches) {
    const separatedRounds = matches.reduce((aggr, current) => {
        let {round} = current;
        round = round || 0;
        if (!aggr[round]) {
            aggr[round] = [];
        }
        aggr[round].push(current);
        return aggr;
    }, {});
    
    const rounds = [];
    for (const roundNumber in separatedRounds) {
        if (separatedRounds.hasOwnProperty(roundNumber)) {
            rounds.push({
                name: 'Round ' + roundNumber,
                matches: separatedRounds[roundNumber].map(m => {
                    return {$ref: 'game_' + m.match_id}
                })
            })
        }
    }
    
    return rounds;
    
}

