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
        findById: getSQL('tournament-sql/findById.sql')
    },
    account: {
        add: getSQL('account-sql/createAccount.sql'),
        findOne: getSQL('account-sql/findAccount.sql')
    },
    match: {
        findByTournament: getSQL('match-sql/findMatchesByTournament.sql')
    },
    team: {
        findByTournament: getSQL('team-sql/findTeamsByTournament.sql')
    }
}