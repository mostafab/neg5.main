import { matchesReceived } from './../actions/match.actions';

export default class MatchKeyDetailsService {
  constructor(MatchService) {
    this.MatchService = MatchService;
    this.roundToNumMatches = {};
    this.bindListeners();
  }

  bindListeners() {
    this.MatchService.on(matchesReceived('MatchService'), this._onReceivedMatches.bind(this));
  }

  _onReceivedMatches(payload) {
    const matches = payload.matches;
    this.numMatches = matches.length;

    this.roundToNumMatches = matches.reduce((aggr, current) => {
      aggr[current.round] ? aggr[current.round]++ : aggr[current.round] = 1;
      return aggr;
    }, {});

    console.log(this.roundToNumMatches);
  }
}

MatchKeyDetailsService.$inject = ['MatchService'];
