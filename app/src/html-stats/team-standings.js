import statsDB from './../data-access/stats';

export default (tournamentId, phaseId = null) => new Promise((resolve, reject) => {
    
    const teamStandingsPromise = statsDB.teamReport(tournamentId, phaseId);
    
    teamStandingsPromise.then(results => {
        
        let {pointScheme, stats, divisions} = results;
        
        resolve(buildHtmlString(stats, divisions, pointScheme));
        
    })
    
})

function buildHtmlString(stats, divisions, pointScheme) {
    let reportHtmlString = '<HTML>';
    
    reportHtmlString += '</HTML>';
    
    return reportHtmlString;
}