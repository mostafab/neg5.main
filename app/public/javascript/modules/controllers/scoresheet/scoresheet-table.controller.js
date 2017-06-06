import angular from 'angular';

export default class ScoresheetTableController {
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

  getTeamBonusPointsForCycle(teamId, cycleIndex) {
    const cycle = cycleIndex + 1 ===
      this.game.currentCycle.number ? this.game.currentCycle : this.game.cycles[cycleIndex];
    return cycle.bonuses.filter(b =>
      b === teamId).length * this.pointScheme.bonusPointValue;
  }

  getTeamThatGotTossup(cycle) {
    const index = cycle.answers.findIndex(a => a.type !== 'Neg');
    return index === -1 ? null : cycle.answers[index].teamId;
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
      score += cycle.bonuses.filter(b =>
        b === teamId).length * this.pointScheme.bonusPointValue;
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

  setTeamThatGotBonusPartCurrentCycle(index, team, bonusesArray) {
    bonusesArray[index] = bonusesArray[index] === team.id ? null : team.id;
  }

  editCycleBonuses(cycle) {
    if (cycle.bonusesCopy) {
      angular.copy(cycle.bonusesCopy, cycle.bonuses);
      cycle.editingBonus = false;
    }
  }

  displayPlayerAnswerForCycle(player, cycleIndex) {
    const cycle = this.game.cycles[cycleIndex];
    if (cycleIndex < this.game.currentCycle.number - 1) {
      if (!cycle.editing) {
        cycle.editing = {};
      }
      if (!cycle.newAnswer) {
        cycle.newAnswer = {};
      }
      const playerAnswer = this.getPlayerAnswerForCycle(player, cycle);
      if (!playerAnswer) {
        cycle.newAnswer[player.id] = null;
      } else {
        cycle.newAnswer[player.id] =
          this.pointScheme.tossupValues.find(tv => tv.value === playerAnswer.value);
      }
      cycle.editing[player.id] = true;
    }
  }

  displayCycleBonuses(teamId, cycleIndex) {
    const cycle = this.game.cycles[cycleIndex];
    if (cycleIndex < this.game.currentCycle.number - 1 &&
      this.cycleHasCorrectAnswer(cycle)) {
      cycle.bonusesCopy = [];
      angular.copy(cycle.bonuses, cycle.bonusesCopy);
      cycle.editingBonus = true;
    }
  }

  getPlayerAnswerForCycle(player, cycle) {
    return cycle.answers.find(a => a.playerId === player.id);
  }

  editPlayerAnswerForCycle(playerId, teamId, newTossupValue, cycle) {
    let filterFunction;
    if (newTossupValue && newTossupValue.type !== 'Neg') {
      filterFunction = a => a.teamId !== teamId && a.type === 'Neg';
    } else {
      filterFunction = a => a.teamId !== teamId && a.type !== 'Neg';
    }
    const filteredAnswers = cycle.answers.filter(filterFunction);
    if (newTossupValue) {
      filteredAnswers.push({
        playerId,
        teamId,
        value: newTossupValue.value,
        type: newTossupValue.type,
      });
    }
    cycle.answers = filteredAnswers;
    if (!this.cycleHasCorrectAnswer(cycle)) {
      cycle.bonuses = [];
    }
    if (!cycle.editing) {
      cycle.editing = {};
    }
    cycle.editing[playerId] = false;
  }

  cycleHasCorrectAnswer(cycle) {
    return cycle.answers.some(a => a.type !== 'Neg');
  }
}

ScoresheetTableController.$inject = [
  '$scope',
  'ScoresheetService',
  'TeamService',
  'TournamentService',
];
