export default class MatchKeyDetailsService {
  constructor(MatchService) {
    this.eventListeneres = [];
    this.MatchService = MatchService;
  }
}

MatchKeyDetailsService.$inject = ['MatchService'];
