import TournamentStatsChangeEmitter from './../event-emitters/stats-change-emitter';
import TournamentStatsChangeEvent from './../events/TournamentStatsChangeEvent';
import { StatsReportManager as StatsReportManager } from './../managers/stats-models/report';
import tournamentManager from './../managers/model-managers/tournament';
import StatReportType from './../enums/stat-report-type';

const tournamentStatsChangeEmitter = new TournamentStatsChangeEmitter();

export const events = {
  TOURNAMENT_STAT_CHANGE_EVENT: 'tournamentStatsChangedEvent',
}

export const bufferTournamentStatsChangedEmittion = ({ tournamentId }) => {
  setTimeout(() => {
      tournamentStatsChangeEmitter.emit(events.TOURNAMENT_STAT_CHANGE_EVENT, new TournamentStatsChangeEvent(tournamentId));
  }, 2000);
}

tournamentStatsChangeEmitter.on(events.TOURNAMENT_STAT_CHANGE_EVENT, recalculateStats);

async function recalculateStats(statsChangeEvent) {
  const statsReportManager = new StatsReportManager(statsChangeEvent.tournamentId);
  const tournamentPhases = await tournamentManager.getPhases(statsChangeEvent.tournamentId);
  for (const phase of tournamentPhases) {
    const phaseId = phase.id;
    statsReportManager.generateAndSavePlayerFullReport(phaseId);
  }
  statsReportManager.generateAndSavePlayerFullReport(null);
}

export default tournamentStatsChangeEmitter;
