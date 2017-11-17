import MatchEventEmitter from './../event-emitters/match-event-emitter';
import { StatsReportManager as StatsReportManager } from './../managers/stats-models/report';
import tournamentManager from './../managers/model-managers/tournament';
import StatReportType from './../enums/stat-report-type';

const matchEventEmitter = new MatchEventEmitter();

export const events = {
  MATCH_CHANGE_EVENT: 'matchChangeEvent',
}

matchEventEmitter.on(events.MATCH_CHANGE_EVENT, recalculateStats);

async function recalculateStats(matchChangeEvent) {
  const statsReportManager = new StatsReportManager(matchChangeEvent.tournamentId);
  const tournamentPhases = await tournamentManager.getPhases(matchChangeEvent.tournamentId);
  for (const phase of tournamentPhases) {
    const phaseId = phase.id;
    const statPromises = [
      statsReportManager.generatePlayerFullReport(phaseId),
    ];
    const [ playerFullReport ] = await Promise.all(statPromises);
    statsReportManager.addOrUpdate(phaseId, StatReportType.INDIVIDUAL_FULL, playerFullReport);
  }

  const promisesForNullPhase = [
    statsReportManager.generatePlayerFullReport(null),
  ]
  const [ playerFullReport ] = await Promise.all(promisesForNullPhase);
  statsReportManager.addOrUpdate(null, StatReportType.INDIVIDUAL_FULL, playerFullReport);
}

export default matchEventEmitter;
