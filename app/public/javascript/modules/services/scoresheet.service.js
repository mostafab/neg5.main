export default class ScoresheetService {
  constructor($q, TournamentService, PhaseService, MatchService) {
    this.$q = $q;
    this.TournamentService = TournamentService;
    this.PhaseService = PhaseService;
    this.MatchService = MatchService;

    this.pointScheme = this.TournamentService.pointScheme;
    this.rules = this.TournamentService.rules;
    this.phases = this.PhaseService.phases;
    this.game = ScoresheetService.newScoresheet();
  }

  static newScoresheet() {
    return {
      teams: [
        {
          teamInfo: null,
          players: [],
          newPlayer: '',
          overtime: 0,
        },
        {
          teamInfo: null,
          players: [],
          newPlayer: '',
          overtime: 0,
        },
      ],
      cycles: ScoresheetService.initializeCyclesArray(20),
      currentCycle: {
        number: 1,
        answers: [],
        bonuses: [],
      },
      onTossup: true,
      round: 0,
      packet: null,
      notes: null,
      moderator: null,
      phases: [],
      room: null,
    };
  }

  static initializeCyclesArray(n) {
    const arr = [];
    for (let i = 0; i < n; i++) {
      arr.push({
        answers: [],
        bonuses: [],
      });
    }
    return arr;
  }
}

ScoresheetService.$inject = ['$q', 'TournamentService', 'PhaseService', 'MatchService'];


