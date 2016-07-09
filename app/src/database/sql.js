import pgp from 'pg-promise';

let QueryFile = pgp.QueryFile;

let getSQL = (file) => {
    const relativePath = './../sql/';
    return new QueryFile(relativePath + file, {minify: true});
}

export default {
    tournament: {
        add: getSQL('tournament-sql/createTournament.sql')
    }
}