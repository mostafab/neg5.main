import MatchEventEmitter from './../event-emitters/match-event-emitter';
import { StatsReport as StatsReportManager } from './../managers/stats-models/report';
import matchManager from './../managers/model-managers/match';

const matchEventEmitter = new MatchEventEmitter();

export const events = {
  MATCH_CHANGE_EVENT: 'matchChangeEvent',
}

matchEventEmitter.on(events.MATCH_CHANGE_EVENT, async matchChangeEvent => {
  const statsReportManager = new StatsReportManager(matchChangeEvent.tournamentId);
  const matchingMatch = await matchManager.findById(matchChangeEvent.tournamentId, matchChangeEvent.matchId);
  for (const phase of matchingMatch.phases) {
    const phaseId = phase.phase_id;
    const statPromises = [
      statsReportManager.generateTeamReport(phaseId),
      statsReportManager.generateIndividualReport(phaseId),
      statsReportManager.generateTeamFullReport(phaseId),
      statsReportManager.generatePlayerFullReport(phaseId),
      statsReportManager.generateRoundReport(phaseId),
    ];
    const [ teamReport, individualReport, teamFullReport, playerFullReport, roundReport ] = await Promise.all(statPromises);
    console.log(roundReport.stats);
  }
  const promisesForNullPhase = [
    statsReportManager.generateTeamReport(null),
    statsReportManager.generateIndividualReport(null),
    statsReportManager.generateTeamFullReport(null),
    statsReportManager.generatePlayerFullReport(null),
    statsReportManager.generateRoundReport(null),
  ]
  const [ teamReport, individualReport, teamFullReport, playerFullReport, roundReport ] = await Promise.all(promisesForNullPhase);
  console.log(roundReport.stats);
});

export default matchEventEmitter;
