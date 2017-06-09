export default class ScoresheetPointsTrackerService {
  constructor(ScoresheetService, TournamentService) {
    this.ScoresheetService = ScoresheetService;
    this.TournamentService = TournamentService;

    this.game = this.ScoresheetService.game;
    this.pointScheme = this.TournamentService.pointScheme;
  }

  getPlayerTotalPoints(player) {
    let total = 0;
    this.pointScheme.tossupValues.forEach((tv) => {
      const numberForCurrentTV = this.getNumberOfTossupTypeForPlayer(player, tv);
      total += (numberForCurrentTV * tv.value);
    });
    return total;
  }

  getNumberOfTossupTypeForPlayer(player, tossupValue) {
    const cycleTotal = this.game.cycles.reduce((total, cycle) => {
      const numberInCycle = cycle.answers.filter(a =>
        a.playerId === player.id && a.value === tossupValue.value).length;
      return total + numberInCycle;
    }, 0);
    const numberInCurrentCycle = this.game.currentCycle.answers.filter(a =>
      a.playerId === player.id && a.type === tossupValue.type).length;
    return cycleTotal + numberInCurrentCycle;
  }

  getNumberOfAnswersForPlayer(player) {
    return this.game.cycles.reduce((total, current) => {
      const playerAnsweredThisCycle = current.answers.some(a => a.playerId === player.id);
      return total + (playerAnsweredThisCycle ? 1 : 0);
    }, 0);
  }

  getTeamScoreUpToCycle(teamId, cycleIndex) {
    let score = 0;
    for (let i = 0; i <= cycleIndex; i++) {
      const cycle = this.game.cycles[i];
      cycle.answers.forEach((a) => {
        if (a.teamId === teamId) {
          score += a.value;
        }
      });
      score += cycle.bonuses.filter(b => b === teamId).length * this.pointScheme.bonusPointValue;
    }
    if (cycleIndex + 1 === this.game.currentCycle.number) {
      this.game.currentCycle.answers.forEach((a) => {
        if (a.teamId === teamId) {
          score += a.value;
        }
      });
      score += this.game.currentCycle.bonuses.filter(b =>
        b === teamId).length * this.pointScheme.bonusPointValue;
    }
    return score;
  }

}
