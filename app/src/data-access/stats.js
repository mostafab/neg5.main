import { readOnlyTransaction, txMap as tx } from '../database/db';
import sql from '../database/sql';

const statSQL = sql.statistics;
const phaseSQL = sql.phase;
const tournamentSQL = sql.tournament;
const divisionSQL = sql.division;

function formatStatisticsResults(result) {
  return {
    phase: result[0][0] || { name: 'All Phases', id: null },
    pointScheme: result[2].tossup_point_scheme.sort((first, second) => second.value - first.value),
    tournamentName: result[2].name,
    activePhaseId: result[2].active_phase_id,
    stats: result[1],
  };
}

export default {

  individualReport: (tournamentId, phaseId = null) => new Promise((resolve, reject) => {
    const queriesArray = [];
    queriesArray.push(
      {
        text: phaseSQL.findById,
        params: [tournamentId, phaseId],
        queryType: tx.any,
      },
      {
        text: statSQL.individual,
        params: [tournamentId, phaseId],
        queryType: tx.any,
      },
      {
        text: tournamentSQL.findById,
        params: [tournamentId],
        queryType: tx.one,
      },
    );
    readOnlyTransaction(queriesArray)
        .then((result) => {
          const formattedResult = formatStatisticsResults(result);
          resolve(formattedResult);
        })
        .catch(error => reject(error));
  }),

  teamReport: (tournamentId, phaseId = null) => new Promise((resolve, reject) => {
    const queriesArray = [];
    queriesArray.push(
      {
        text: phaseSQL.findById,
        params: [tournamentId, phaseId],
        queryType: tx.any,
      },
      {
        text: phaseId ? statSQL.teamGivenPhase : statSQL.teamDefaultPhase,
        params: phaseId ? [tournamentId, phaseId] : [tournamentId],
        queryType: tx.any,
      },
      {
        text: tournamentSQL.findById,
        params: [tournamentId],
        queryType: tx.one,
      },
      {
        text: divisionSQL.findByTournament,
        params: [tournamentId],
        queryType: tx.any,
      },
    );
    readOnlyTransaction(queriesArray)
      .then((result) => {
        const formattedResult = formatStatisticsResults(result);
        if (phaseId) {
          formattedResult.divisions = result[3].filter(d =>
            d.phase_id === result[0][0].id);
        } else {
          formattedResult.divisions = result[3].filter(d =>
            d.phase_id === result[2].active_phase_id);
        }
        resolve(formattedResult);
      })
      .catch(error => reject(error));
  }),

  teamFullReport: (tournamentId, phaseId = null) => new Promise((resolve, reject) => {
    const queriesArray = [];
    queriesArray.push(
      {
        text: phaseSQL.findById,
        params: [tournamentId, phaseId],
        queryType: tx.any,
      },
      {
        text: statSQL.teamFull,
        params: [tournamentId, phaseId],
        queryType: tx.any,
      },
      {
        text: tournamentSQL.findById,
        params: [tournamentId],
        queryType: tx.one,
      },
    );
    readOnlyTransaction(queriesArray)
        .then(result => resolve(formatStatisticsResults(result)))
        .catch(error => reject(error));
  }),

  playerFullReport: (tournamentId, phaseId = null) => new Promise((resolve, reject) => {
    const queriesArray = [];
    queriesArray.push(
      {
        text: phaseSQL.findById,
        params: [tournamentId, phaseId],
        queryType: tx.any,
      },
      {
        text: statSQL.playerFull,
        params: [tournamentId, phaseId],
        queryType: tx.any,
      },
      {
        text: tournamentSQL.findById,
        params: [tournamentId],
        queryType: tx.one,
      },
    );
    readOnlyTransaction(queriesArray)
        .then(result => resolve(formatStatisticsResults(result)))
        .catch(error => reject(error));
  }),

  roundReport: (tournamentId, phaseId = null) => new Promise((resolve, reject) => {
    const queriesArray = [];
    queriesArray.push(
      {
        text: phaseSQL.findById,
        params: [tournamentId, phaseId],
        queryType: tx.any,
      },
      {
        text: statSQL.roundReport,
        params: [tournamentId, phaseId],
        queryType: tx.any,
      },
      {
        text: tournamentSQL.findById,
        params: [tournamentId],
        queryType: tx.one,
      },
    );
    readOnlyTransaction(queriesArray)
        .then(result => resolve(formatStatisticsResults(result)))
        .catch(error => reject(error));
  }),
};
