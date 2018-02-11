import { query, transaction, queryTypeMap as qm, txMap as tm } from '../database/db';
import { buildMatchPhasesObject, buildMatchPlayers, buildMatchTeams, buildPlayerMatchPoints } from './../helpers/array_builders/match.builder';
import sql from '../database/sql';

const matchSQL = sql.match;

export default {
  getMatchesByTournament: tournamentId => new Promise((resolve, reject) => {
    const params = [tournamentId];
    query(matchSQL.findByTournament, params, qm.any)
        .then(matches => resolve(matches.map(m => ({
          ...m,
          phases: m.phases.filter(p => p.phase_id !== null),
        }))))
        .catch(error => reject(error));
  }),

  /**
   * Returns either the details for a single match or
   * all matches depending on if detailedAll is true
   */
  findById: (tournamentId, matchId, detailedAll = false) => new Promise((resolve, reject) => {
    const params = [tournamentId, detailedAll ? null : matchId];
    const returnType = detailedAll ? qm.any : qm.one;
    query(matchSQL.findById, params, returnType)
        .then(foundMatch => resolve(foundMatch))
        .catch(error => reject(error));
  }),

  findAllForStats: (tournamentId) => new Promise((resolve, reject) => {
    const params = [tournamentId];
    query(matchSQL.findAllForStats, params, qm.any)
        .then(foundMatches => resolve(foundMatches))
        .catch(error => reject(error));
  }),

  addToTournament: (tournamentId, matchInformation, user, replacing = false) =>
    new Promise((resolve, reject) => {
      const { id: matchId, moderator, notes, packet, phases,
          room, round, teams, tuh, scoresheet, serialId } = matchInformation;
      const queriesArray = [];
      const matchPhases = buildMatchPhasesObject(tournamentId, matchId, phases);
      const matchTeams = buildMatchTeams(tournamentId, matchId, teams);
      const matchPlayers = buildMatchPlayers(tournamentId, matchId, teams);
      const matchPlayerPoints = buildPlayerMatchPoints(tournamentId, matchId, matchPlayers.players);

      if (replacing) {
        queriesArray.push({
          text: matchSQL.remove,
          params: [tournamentId, matchId],
          queryType: tm.one,
        });
      }

      queriesArray.push(
        {
          text: matchSQL.add.addMatch,
          params: [matchId, tournamentId, round, room, moderator, packet,
            tuh, notes, scoresheet, user, serialId],
          queryType: tm.one,
        },
        {
          text: matchSQL.add.addMatchPhases,
          params: [matchPhases.phaseMatchId, matchPhases.phaseTournamentId, matchPhases.phaseId],
          queryType: tm.any,
        },
        {
          text: matchSQL.add.addMatchTeams,
          params: [matchTeams.teamIds, matchTeams.matchId, matchTeams.tournamentId,
            matchTeams.score, matchTeams.bouncebacks, matchTeams.overtime],
          queryType: tm.many,
        },
        {
          text: matchSQL.add.addMatchPlayers,
          params: [matchPlayers.playerIds, matchPlayers.matchIds,
            matchPlayers.tournamentIds, matchPlayers.tossups],
          queryType: tm.any,
        },
        {
          text: matchSQL.add.addPlayerTossups,
          params: [matchPlayerPoints.playerIds, matchPlayerPoints.matchIds,
            matchPlayerPoints.tournamentIds, matchPlayerPoints.values, matchPlayerPoints.numbers],
          queryType: tm.any,
        },
      );

      transaction(queriesArray)
          .then(result => resolve(result))
          .catch(error => reject(error));
    }),

  deleteTournamentMatch: (tournamentId, matchId) => new Promise((resolve, reject) => {
    const params = [tournamentId, matchId];
    query(matchSQL.remove, params, qm.one)
        .then(result => resolve(result))
        .catch(error => reject(error));
  }),

};
