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
  console.log(matchingMatch);
});

export default matchEventEmitter;
