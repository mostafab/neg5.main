import { matchesReceived } from './../actions/match.actions';

export default class MatchKeyDetailsService {
  constructor(MatchService) {
    this.MatchService = MatchService;
    this.roundToNumMatches = {};
    this.bindListeners();
  }

  bindListeners() {
    this.MatchService.on(matchesReceived, this._onReceivedMatches.bind(this));
  }

  _onReceivedMatches(payload) {
    const matches = payload.matches;
    this.numMatches = matches.length;

    this.roundToNumMatches = matches.reduce((aggr, current) => {
      const key = current.round === null ? 'N/A' : current.round;
      aggr[key] ? aggr[key]++ : aggr[key] = 1;
      return aggr;
    }, {});
  }
}

MatchKeyDetailsService.$inject = ['MatchService'];
