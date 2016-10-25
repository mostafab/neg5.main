import statsDB from './../data-access/stats';
import {statsNavigationBarHtml} from './html-utils';

export default (tournamentId, phaseId = null) => new Promise((resolve, reject) => {
    
    const teamStandingsPromise = statsDB.teamReport(tournamentId, phaseId);
    
    teamStandingsPromise
        .then(results => {
            let {pointScheme, stats, divisions, tournamentName, phase} = results;
            resolve(buildHtmlString(tournamentName, stats, divisions, pointScheme));
        })
        .catch(error => reject(error));
    
})

function buildHtmlString(tournamentName, stats, divisions, pointScheme) {
    let reportHtmlString = '<HTML>';
    
    reportHtmlString += statsNavigationBarHtml(tournamentName);
    
    reportHtmlString += '</HTML>';
    
    return reportHtmlString;
}