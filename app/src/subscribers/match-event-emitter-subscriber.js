import TournamentStatsChangeEmitter from './../event-emitters/stats-change-emitter';
import TournamentStatsChangeEvent from './../events/TournamentStatsChangeEvent';

import TournamentSparkClient from './../clients/TournamentSparkClient';

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
  }, 500);
  tournamentCalculationTimeouts.set(tournamentId, timeout);
}

tournamentStatsChangeEmitter.on(events.TOURNAMENT_STAT_CHANGE_EVENT, invalidateCache);

async function invalidateCache(statsChangeEvent) {
  const tournamentId = statsChangeEvent.tournamentId;
  console.log('Sending request to invalidate stats for tournament ' + tournamentId);
  try {
    const result = await TournamentSparkClient.invalidateStats(tournamentId);
    console.log(`Received response ${JSON.stringify(result)}`);
  } catch (e) {
    console.error(e);
  }
}

export default tournamentStatsChangeEmitter;
