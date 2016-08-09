import pgp from 'pg-promise';

let QueryFile = pgp.QueryFile;

let getSQL = (file) => {
    const relativePath = './../sql/';
    return new QueryFile(relativePath + file, {minify: true});
}

export default {
    tournament: {
        add: getSQL('tournament-sql/createTournament.sql'),
        findByUser: getSQL('tournament-sql/findByUser.sql'),
        findById: getSQL('tournament-sql/findById.sql'),
        update: getSQL('tournament-sql/updateTournament.sql'),
        updateRules: getSQL('tournament-sql/updateRules.sql'),
        editPointScheme: {
            add: getSQL('tournament-sql/addTossupPointValue.sql'),
            edit: {
                deleteTossupValues: getSQL('tournament-sql/transactions/editPointScheme/deleteTossupValues.sql'),
                updateBonusValues: getSQL('tournament-sql/transactions/editPointScheme/updateBonusValues.sql'),
                updateTossupPointValues: getSQL('tournament-sql/transactions/editPointScheme/updateTossupPointValues.sql')
            }
        }
    },
    account: {
        add: getSQL('account-sql/createAccount.sql'),
        findOne: getSQL('account-sql/findAccount.sql'),
        permissions: getSQL('tournament-sql/tournamentPermission.sql'),
        findUsers: getSQL('account-sql/findUsers.sql')
    },
    match: {
        findByTournament: getSQL('match-sql/findMatchesByTournament.sql'),
        add: {
            addMatch: getSQL('match-sql/transactions/addMatch/addMatchInfoToTournament.sql'),
            addMatchPhases: getSQL('match-sql/transactions/addMatch/addMatchPhases.sql'),
            addMatchPlayers: getSQL('match-sql/transactions/addMatch/addMatchPlayers.sql'),
            addMatchTeams: getSQL('match-sql/transactions/addMatch/addMatchTeams.sql'),
            addPlayerTossups: getSQL('match-sql/transactions/addMatch/addPlayerMatchTossups.sql')
        }
    },
    team: {
        findByTournament: getSQL('team-sql/findTeamsByTournament.sql'),
        findById: getSQL('team-sql/findTeamById.sql'),
        add: {
            addTeam: getSQL('team-sql/transactions/addTeam/addTeamToTournament.sql'),
            addPlayers: getSQL('team-sql/transactions/addTeam/addTeamPlayers.sql'),
            addDivisions: getSQL('team-sql/transactions/addTeam/addTeamDivisions.sql')
        }
    },
    collaborator: {
        add: getSQL('collaborator-sql/addCollaborator.sql'),
        findByTournament: getSQL('collaborator-sql/findCollaboratorsByTournament.sql'),
        edit: getSQL('collaborator-sql/updateCollaboratorPermissions.sql'),
        remove: getSQL('collaborator-sql/deleteCollaborator.sql')
    },
    division: {
        findByTournament: getSQL('division-sql/getTournamentDivisions.sql'),
        edit: getSQL('division-sql/editTournamentDivision.sql'),
        add: getSQL('division-sql/addDivisionToTournament.sql'),
        remove: getSQL('division-sql/removeDivisionFromTournament.sql')
    },
    phase: {
        findByTournament: getSQL('phase-sql/getTournamentPhases.sql')
    }
}