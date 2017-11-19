import { readOnlyQuery, query as readWriteQuery, queryTypeMap as qm } from '../database/db';
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

  fetchReport: async (tournamentId, phaseId, reportType) => {
    const params = {
      tournamentId,
      phaseId,
      reportType
    }
    try {
      return await readOnlyQuery(phaseId ? statSQL.reports.getByIdReportAndPhase : statSQL.reports.getNullPhase, params, qm.one);
    } catch (error) {
      throw err;
    }
  },

  add: async (tournamentId, phaseId, reportType, stats) => {
    const params = {
      tournamentId,
      phaseId,
      reportType,
      stats,
    };
    try {
      return await readWriteQuery(statSQL.reports.add, params, qm.one);
    } catch (error) {
      throw error;
    }
  },

  update: async (tournamentId, phaseId, reportType, stats) => {
    const params = {
      tournamentId,
      phaseId,
      reportType,
      stats,
    };
    try {
      return await readWriteQuery(phaseId ? statSQL.reports.update : statSQL.reports.updateWithNullPhase, params, qm.one);
    } catch (err) {
      throw err;
    }
  }
};
