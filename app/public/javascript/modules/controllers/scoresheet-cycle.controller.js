export default class ScoresheetCycleController {
  constructor($scope, ScoresheetService, TeamService, TournamentService) {
    this.$scope = $scope;
    this.ScoresheetService = ScoresheetService;
    this.TeamService = TeamService;
    this.TournamentService = TournamentService;
    this.game = this.ScoresheetService.game;
    this.teams = this.TeamService.teams;
    this.pointScheme = this.TournamentService.pointScheme;
    this.rules = this.TournamentService.rules;
    this.$scope.tournamentId = this.$scope.$parent.tournamentId;
  }

  loadTeamPlayers(team) {
    this.ScoresheetService.loadTeamPlayers(this.$scope.tournamentId, team)
      .then((players) => {

      })
      .catch(err => {

      })
      .finally(() => {

      });
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

  teamDidNotNegInCycle(teamId, cycle) {
    return cycle.answers.findIndex(answer => answer.type === 'Neg' && answer.teamId === teamId)
      === -1;
  }

  removeTeamNegsFromCycle(teamId, cycle) {
    cycle.answers = cycle.answers.filter(a => !(a.type === 'Neg' && a.teamId === teamId));
  }

  addPlayerAnswerToCurrentCycle(player, teamInfo, answer) {
    if (this.teamDidNotAnswerInCycle(teamInfo, this.game.currentCycle)) {
      this.game.currentCycle.answers.push({
        playerId: player.id,
        teamId: teamInfo.id,
        value: answer.value,
        type: answer.type,
      });
    }
  }

  teamDidNotAnswerInCycle(team, cycle) {
    return cycle.answers.findIndex(answer => answer.teamId === team.id) === -1;
  }

  switchToBonusIfTossupGotten(answer, teamId) {
    if (answer.type !== 'Neg' && this.teamDidNotNegInCycle(teamId, this.game.currentCycle)) {
      this.switchCurrentCycleContext(true);
    }
  }

  switchCurrentCycleContext(toBonus) {
    this.game.onTossup = !toBonus;
  }

}

ScoresheetCycleController.$inject = ['$scope', 'ScoresheetService', 'TeamService', 'TournamentService'];
