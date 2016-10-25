export const statsNavigationBarHtml = (tournamentName) => {
    const normalizedTournamentName = tournamentName.toLowerCase().replace(/ /g, '_');
    return `
        <table border=0 width=100%>
            <tr>
            <td><A HREF=${normalizedTournamentName}_standings.html>Standings</A></td>
            <td><A HREF=${normalizedTournamentName}_individuals.html>Individuals</A></td>
            <td><A HREF=${normalizedTournamentName}_games.html>Scoreboard</A></td>
            <td><A HREF=${normalizedTournamentName}_teamdetail.html>Team Detail</A></td>
            <td><A HREF=${normalizedTournamentName}_playerdetail.html>Individual Detail</A></td>
            <td><A HREF=${normalizedTournamentName}_rounds.html>Round Report</A></td>
            </tr>
            </table>
    `
}

export const buildTableHeader = (...columnNames) => {
    let tableString = '<tr>';
    columnNames.forEach(column => tableString += `<td ALIGN=${column.left ? 'LEFT': 'RIGHT'}><B>${column.name}</B></td>`);
    
    tableString += '</tr>';
    return tableString;
}