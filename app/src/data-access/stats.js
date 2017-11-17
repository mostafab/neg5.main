import { readOnlyQuery, queryTypeMap as qm } from '../database/db';
import sql from '../database/sql';

const statSQL = sql.statistics;
const phaseSQL = sql.phase;
const tournamentSQL = sql.tournament;
const divisionSQL = sql.division;

function formatStatisticsResults(result) {
  return {
    stats: result,
  };
}

export default {

  generateIndividualReport: (tournamentId, phaseId = null) => new Promise((resolve, reject) => {
    readOnlyQuery(statSQL.individual, [tournamentId, phaseId], qm.any)
        .then((result) => {
          const formattedResult = formatStatisticsResults(result);
          resolve(formattedResult);
        })
        .catch(error => reject(error));
  }),

  generateTeamReport: (tournamentId, phaseId = null) => new Promise((resolve, reject) => {
    const query = phaseId ? statSQL.teamGivenPhase : statSQL.teamDefaultPhase;
    const params = phaseId ? [tournamentId, phaseId] : [tournamentId];
    readOnlyQuery(query, params, qm.any)
      .then((result) => {
        const formattedResult = formatStatisticsResults(result);
        resolve(formattedResult);
      })
      .catch(error => reject(error));
  }),

  generateTeamFullReport: (tournamentId, phaseId = null) => new Promise((resolve, reject) => {
    const query = statSQL.teamFull;
    const params = [tournamentId, phaseId];
    readOnlyQuery(query, params, qm.any)
        .then(result => resolve(formatStatisticsResults(result)))
        .catch(error => reject(error));
  }),

  generatePlayerFullReport: (tournamentId, phaseId = null) => new Promise((resolve, reject) => {
    readOnlyQuery(statSQL.playerFull, [tournamentId, phaseId], qm.any)
        .then(result => resolve(formatStatisticsResults(result)))
        .catch(error => reject(error));
  }),

  generateRoundReport: (tournamentId, phaseId = null) => new Promise((resolve, reject) => {
    readOnlyQuery(statSQL.roundReport, [tournamentId, phaseId], qm.any)
        .then(result => resolve(formatStatisticsResults(result)))
        .catch(error => reject(error));
  }),
};
