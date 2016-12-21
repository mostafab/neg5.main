import { query, transaction, queryTypeMap as qm, txMap as tm } from '../database/db';
import sql from '../database/sql';

const { tournament, collaborator, division, phase, account } = sql;

function buildTournamentPointSchemeInsertQuery(rows, tournamentId) {
  const tournamentIds = rows.map(() => tournamentId);
  const values = rows.map(row => row.value);
  const types = rows.map(row => row.type);
  return {
    tournamentIds,
    values,
    types,
  };
}

export default {
  saveTournament: tournamentInfo => new Promise((resolve, reject) => {
    const { id, name, date, questionSet, comments,
      location, tossupScheme, username } = tournamentInfo;

    const tournamentParams = [id, name, date, questionSet, comments, location, username];
    const { tournamentIds, values,
      types } = buildTournamentPointSchemeInsertQuery(tossupScheme, id);

    const queriesArray = [];
    queriesArray.push(
      {
        text: tournament.add,
        params: tournamentParams,
        queryType: tm.one,
      },
      {
        text: tournament.addTossupScheme,
        params: [id, tournamentIds, values, types],
        queryType: tm.any,
      },
    );
    transaction(queriesArray)
      .then((result) => {
        const formatted = {
          tournament: result[0],
          pointScheme: result[1],
        };
        resolve(formatted);
      })
      .catch(error => reject(error));
  }),

  findTournamentsByUser: username => new Promise((resolve, reject) => {
    const params = [username];
    query(tournament.findByUser, params, qm.any)
        .then(tournaments => resolve(tournaments))
        .catch(error => reject(error));
  }),

  findTournamentById: (id, currentUser = null, getPermissions = true) =>
    new Promise((resolve, reject) => {
      const queriesArray = [
        {
          text: tournament.findById,
          params: [id],
          queryType: tm.one,
        },
      ];
      if (getPermissions) {
        queriesArray.push({
          text: account.permissions,
          params: [id, currentUser],
          queryType: tm.one,
        });
      }
      transaction(queriesArray)
        .then(result => resolve({
          tournament: result[0],
          permissions: result[1],
        }))
        .catch(error => reject(error));
    }),

  updateTournament: (id, newInfo) => new Promise((resolve, reject) => {
    const { name, location = null, date = null, questionSet = null,
      comments = null, hidden = false } = newInfo;
    const params = [id, name, location, date, questionSet, comments, hidden];
    query(tournament.update, params, qm.one)
        .then(updatedInfo => resolve(updatedInfo))
        .catch(error => reject(error));
  }),

  updateRules: (id, { bouncebacks, maxActive }) => new Promise((resolve, reject) => {
    const params = [id, maxActive, bouncebacks];
    query(tournament.updateRules, params, qm.one)
        .then(result => resolve(result))
        .catch(error => reject(error));
  }),

  addTossupPointValue: (id, { type, value }) => new Promise((resolve, reject) => {
    const params = [id, type, value];
    query(tournament.editPointScheme.add, params, qm.one)
        .then(newTossupValue => resolve(newTossupValue))
        .catch(error => reject(error));
  }),

  updateTossupPointValues: (id, tossupPointValues, bonusPointValue, partsPerBonus) =>
    new Promise((resolve, reject) => {
      const editQueries = tournament.editPointScheme.edit;
      const queriesArray = [];
      const { tournamentIds, values,
        types } = buildTournamentPointSchemeInsertQuery(tossupPointValues, id);
      queriesArray.push(
        {
          text: editQueries.deleteTossupValues,
          params: [id],
          queryType: tm.none,
        },
        {
          text: editQueries.updateBonusValues,
          params: [id, bonusPointValue, partsPerBonus],
          queryType: tm.one,
        },
        {
          text: editQueries.updateTossupPointValues,
          params: [id, tournamentIds, values, types],
          queryType: tm.any,
        },
      );

      transaction(queriesArray)
        .then((result) => {
          const data = {
            partsPerBonus: result[1].parts_per_bonus,
            bonusPointValue: result[1].bonus_point_value,
            tossupValues: result[2],
          };
          resolve(data);
        })
        .catch(error => reject(error));
    }),

  addCollaborator: (id, username, isAdmin) => new Promise((resolve, reject) => {
    const params = [id, username, isAdmin];
    query(collaborator.add, params, qm.one)
        .then(result => resolve(result))
        .catch(error => reject(error));
  }),

  findTournamentCollaborators: id => new Promise((resolve, reject) => {
    const params = [id];
    query(collaborator.findByTournament, params, qm.any)
        .then(result => resolve(result))
        .catch(error => reject(error));
  }),

  updateCollaborator: (id, username, isAdmin) => {
      return new Promise((resolve, reject) => {
          let params = [id, username, isAdmin];
          query(collaborator.edit, params, qm.one)
              .then(result => resolve(result))
              .catch(error => reject(error));
      });
  },

  deleteCollaborator: (id, username) => {
      return new Promise((resolve, reject) => {
          let params = [id, username];
          query(collaborator.remove, params, qm.one)
              .then(result => resolve(result))
              .catch(error => reject(error));
      });
  },

  getTournamentDivisions: (id) => {
      return new Promise((resolve, reject) => {
          let params = [id];
          query(division.findByTournament, params, qm.any)
              .then(result => resolve(result))
              .catch(error => {
                  console.log(error);
                  reject(error);
              });
      })
  },

  editTournamentDivision: (tournamentId, divisionId, newDivisionName) => {
      return new Promise((resolve, reject) => {
          let params = [tournamentId, divisionId, newDivisionName];
          query(division.edit, params, qm.one)
              .then(result => resolve(result))
              .catch(error => reject(error));
      });
  },

  addTournamentDivision: (tournamentId, divisionName, divisionId, phaseId) => {
      return new Promise((resolve, reject) => {
          let params = [tournamentId, divisionId, divisionName, phaseId];
          query(division.add, params, qm.one)
              .then(result => resolve(result))
              .catch(error => reject(error));
      })
  },

  removeDivisionFromTournament: (tournamentId, divisionId) => {
      return new Promise((resolve, reject) => {
          let params = [tournamentId, divisionId];
          query(division.remove, params, qm.one)
              .then(result => resolve(result))
              .catch(error => reject(error));
      })
  },

  getTournamentPhases: (id) => {
      return new Promise((resolve, reject) => {
          let params = [id];
          query(phase.findByTournament, params, qm.any)
              .then(result => resolve(result))
              .catch(error => reject(error));
      })
  },

  updateTournamentPhase: (id, phaseId, newName) => {
      return new Promise((resolve, reject) => {
          let params = [id, phaseId, newName];
          query(phase.update, params, qm.one)
              .then(result => resolve(result))
              .catch(error => reject(error));
      })
  },

  addTournamentPhase: (id, phaseId, name) => {
      return new Promise((resolve, reject) => {
          let params = [id, phaseId, name];
          query(phase.add, params, qm.one)
              .then(result => resolve(result))
              .catch(error => reject(error));
      })
  },

  deleteTournamentPhase: (id, phaseId) => {
      return new Promise((resolve, reject) => {
          let params = [id, phaseId];
          query(phase.remove, params, qm.one)
              .then(result => resolve(result))
              .catch(error => reject(error));
      })
  },

  setTournamentActivePhase: (tournamentId, phaseId) => {
      return new Promise((resolve, reject) => {
          let params = [tournamentId, phaseId];
          query(phase.setActive, params, qm.one)
              .then(result => resolve(result))
              .catch(error => reject(error));
      })
  }
    
}