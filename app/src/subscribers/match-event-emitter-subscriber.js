import MatchEventEmitter from './../event-emitters/match-event-emitter';

const matchEventEmitter = new MatchEventEmitter();

export const events = {
  MATCH_ENTRY: 'matchEntry'
}

matchEventEmitter.on(events.MATCH_ENTRY, matchInformation => {
  console.log('here I am!');
});


export default matchEventEmitter;
