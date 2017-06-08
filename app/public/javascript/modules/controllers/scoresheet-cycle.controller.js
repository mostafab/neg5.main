import angular from 'angular';

export default class ScoresheetCycleController {
  constructor($scope, ScoresheetService, TeamService, TournamentService, ScoresheetCycleService) {
    this.$scope = $scope;
    this.ScoresheetService = ScoresheetService;
    this.TeamService = TeamService;
    this.TournamentService = TournamentService;
    this.ScoresheetCycleService = ScoresheetCycleService;
    this.game = this.ScoresheetService.game;
    this.teams = this.TeamService.teams;
    this.pointScheme = this.TournamentService.pointScheme;
    this.rules = this.TournamentService.rules;
    this.$scope.tournamentId = this.$scope.$parent.tournamentId;

    this.swapPlayers = this.ScoresheetCycleService.swapPlayers;
  }

  loadTeamPlayers(team) {
    this.ScoresheetService.loadTeamPlayers(this.$scope.tournamentId, team);
  }

  // swapPlayers(players, initialIndex, toIndex) {
  //   let targetIndex = toIndex;
  //   if (toIndex < 0) {
  //     targetIndex = players.length - 1;
  //   } else if (toIndex === players.length) {
  //     targetIndex = 0;
  //   }
  //   const tempArray = [];
  //   angular.copy(players, tempArray);
  //   const temp = players[initialIndex];
  //   tempArray[initialIndex] = tempArray[targetIndex];
  //   tempArray[targetIndex] = temp;
  //   angular.copy(tempArray, players);
  // }

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

  getTeamThatGotTossup(cycle) {
    const index = cycle.answers.findIndex(a => a.type !== 'Neg');
    return index === -1 ? null : cycle.answers[index].teamId;
  }

  setTeamThatGotBonusPartCurrentCycle(index, team, bonusesArray) {
    bonusesArray[index] = (bonusesArray[index] === team.id ? null : team.id);
  }

  teamDidNotNegInCycle(teamId, cycle) {
    return cycle.answers.findIndex(answer => answer.type === 'Neg' && answer.teamId === teamId)
      === -1;
  }

  removeTeamNegsFromCycle(teamId, cycle) {
    cycle.answers = cycle.answers.filter(a => !(a.type === 'Neg' && a.teamId === teamId));
  }

  removeLastAnswerFromCycle(cycle) {
    cycle.answers.pop();
    cycle.bonuses = [];
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

  nextCycle() {
    const nextCycleNumber = this.game.currentCycle.number + 1;
    const indexToAddCurrentCycleTo = this.game.currentCycle.number - 1;
    if (indexToAddCurrentCycleTo >= this.game.cycles.length - 1) {
      this.game.cycles.push({
        answers: [],
        bonuses: []
      });
    }
    angular.copy(this.game.currentCycle.answers,
      this.game.cycles[indexToAddCurrentCycleTo].answers);
    angular.copy(this.game.currentCycle.bonuses,
      this.game.cycles[indexToAddCurrentCycleTo].bonuses);
    this.game.currentCycle = {
      number: nextCycleNumber,
      answers: [],
      bonuses: [],
    };
    this.incrementActivePlayersTUH(1);
    this.saveScoresheet();
  }

  lastCycle() {
    if (this.game.currentCycle.number > 1) {
      const indexToReset = this.game.currentCycle.number - 1;
      this.game.cycles[indexToReset] = {
        answers: [],
        bonuses: []
      };
      this.game.cycles[indexToReset - 1].bonuses = [];
      this.game.cycles[indexToReset - 1].answers = [];
      this.game.currentCycle = {
        answers: [],
        bonuses: [],
        number: this.game.currentCycle.number - 1,
      };
    }
    this.incrementActivePlayersTUH(-1);
    this.saveScoresheet();
  }

  switchCurrentCycleContext(toBonus) {
    this.game.onTossup = !toBonus;
  }

  incrementActivePlayersTUH(num) {
    this.game.teams.forEach((team) => {
      team.players.forEach((player) => {
        if (player.active && player.tuh + num >= 0) {
          player.tuh += num;
        }
      });
    });
  }

  saveScoresheet() {
    this.game.lastSavedAt = new Date();
    localStorage.setItem(`scoresheet_${this.$scope.tournamentId}`,
      JSON.stringify(this.game));
  }

}

ScoresheetCycleController.$inject = ['$scope', 'ScoresheetService', 'TeamService', 'TournamentService', 'ScoresheetCycleService'];
