import statsDB from './../data-access/stats';
import {statsNavigationBarHtml, buildTableHeader} from './html-utils';

export default (tournamentId, phaseId = null) => new Promise((resolve, reject) => {
    
    const playerStatsPromise = statsDB.individualReport(tournamentId, phaseId);
    
    playerStatsPromise
        .then(results => {
            const {pointScheme, stats, tournamentName, phase} = results;            
            resolve(buildHtmlString(tournamentName, stats, pointScheme, phase));
        })
        .catch(error => reject(error));
    
})

function buildHtmlString(tournamentName, stats, pointScheme, phase) {
    let reportHtmlString = 
            `<HTML>
                <HEAD>
                    <TITLE> ${tournamentName} Individual Statistics - ${phase.name} </TITLE>
                </HEAD>
                <BODY>`;
    
    reportHtmlString += statsNavigationBarHtml(tournamentName);
    reportHtmlString += `<H1>${tournamentName} Individual Statistics - ${phase.name}</H1>`;
    reportHtmlString += buildPlayersTable(stats, pointScheme, tournamentName);
    
    reportHtmlString += '</BODY></HTML>';
    
    return reportHtmlString;
}

function buildPlayersTable(playerStats, pointScheme, tournamentName) {
    const orderedPoints = pointScheme.sort((first, second) => second.value - first.value).map(tv => tv.value);
    
    let htmlString = '<table border=1 width=100%>';
    htmlString += buildTableHeader(
        {name: 'Rank', left: true}, 
        {name: 'Player', left: true}, 
        {name: 'Team', left: true}, 
        {name: 'GP', left: false}, 
        ...orderedPoints.map(p => {
            return {name: p, left: false}
        }), 
        {name: 'TUH', left: false}, 
        {name: 'P/TU', left: false},
        {name: 'Pts', left: false},
        {name: 'PPG', left: false}
    );
    
    const normalizedTournamentName = tournamentName.toLowerCase().replace(/ /g, '_');
    
    playerStats.forEach((player, index) => htmlString += buildSinglePlayerRow(player, orderedPoints, index + 1, normalizedTournamentName));
    
    htmlString += '</table>'
    
    return htmlString;
}

function buildSinglePlayerRow(player, tossupValues, rank, tournamentName) {
    const playerTossupTotals = player.tossup_totals.reduce((aggr, current) => {
        aggr[current.value] = current.total;
        return aggr;
    }, {});

    let htmlString = `<tr>
        <td ALIGN=LEFT>${rank}</td>
        <td ALIGN=LEFT>
            <A HREF=${tournamentName}_playerdetail.html#${player.player_id}>${player.player_name}</A>
        </td>
        <td ALIGN=LEFT>${player.team_name}</td>
        <td ALIGN=RIGHT>${player.games_played}</td>
        `
    tossupValues.forEach(tv => htmlString += `<td ALIGN=RIGHT>${playerTossupTotals[tv] || 0} </td>`);    
    
    htmlString += `
        <td ALIGN=RIGHT>${player.total_player_tuh}</td>
        <td ALIGN=RIGHT>${player.points_per_tossup}</td>
        <td ALIGN=RIGHT>${player.total_points}</td>
        <td ALIGN=RIGHT>${player.points_per_game}</td>`
    
    htmlString += '</tr>';
    
    return htmlString;
}