import TournamentStatsChangeEmitter from './../event-emitters/stats-change-emitter';
import TournamentStatsChangeEvent from './../events/TournamentStatsChangeEvent';
import { StatsReportManager as StatsReportManager } from './../managers/stats-models/report';
import tournamentManager from './../managers/model-managers/tournament';
import StatReportType from './../enums/stat-report-type';

const tournamentStatsChangeEmitter = new TournamentStatsChangeEmitter();

export const events = {
  TOURNAMENT_STAT_CHANGE_EVENT: 'tournamentStatsChangedEvent',
}

const tournamentCalculationTimeouts = new Map();

export const bufferTournamentStatsChangedEmittion = ({ tournamentId }) => {
  console.log('Buffering stats calculations for tournament ' + tournamentId);
  if (tournamentCalculationTimeouts.has(tournamentId)) {
    clearTimeout(tournamentCalculationTimeouts.get(tournamentId));
    tournamentCalculationTimeouts.delete(tournamentId);
  }
  const timeout = setTimeout(() => {
      tournamentCalculationTimeouts.delete(tournamentId);
      tournamentStatsChangeEmitter.emit(events.TOURNAMENT_STAT_CHANGE_EVENT, new TournamentStatsChangeEvent(tournamentId));
  }, 2000);
  tournamentCalculationTimeouts.set(tournamentId, timeout);
}

tournamentStatsChangeEmitter.on(events.TOURNAMENT_STAT_CHANGE_EVENT, recalculateStats);

async function recalculateStats(statsChangeEvent) {
  console.log('No-op for stats calculation: ' + statsChangeEvent.tournamentId);
}

export default tournamentStatsChangeEmitter;
