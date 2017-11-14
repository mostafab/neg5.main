import angular from 'angular';

export default class ScoresheetTableService {
  constructor(ScoresheetService, TeamService, TournamentService, ScoresheetPointsTrackerService) {
    this.ScoresheetSerivce = ScoresheetService;
    this.TeamService = TeamService;
    this.TournamentService = TournamentService;
    this.ScoresheetPointsTrackerService = ScoresheetPointsTrackerService;

    this.game = this.ScoresheetSerivce.game;
    this.teams = this.TeamService.teams;
    this.pointScheme = this.TournamentService.pointScheme;
    this.rules = this.TournamentService.rules;
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
      const playerAnswer =
        this.ScoresheetPointsTrackerService.getPlayerAnswerForCycle(player, cycle);
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
      this.ScoresheetPointsTrackerService.cycleHasCorrectAnswer(cycle)) {
      cycle.bonusesCopy = [];
      angular.copy(cycle.bonuses, cycle.bonusesCopy);
      cycle.editingBonus = true;
    }
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
    if (!this.ScoresheetPointsTrackerService.cycleHasCorrectAnswer(cycle)) {
      cycle.bonuses = [];
    }
    if (!cycle.editing) {
      cycle.editing = {};
    }
    cycle.editing[playerId] = false;
  }
}

ScoresheetTableService.$inject = [
  'ScoresheetService',
  'TeamService',
  'TournamentService',
  'ScoresheetPointsTrackerService',
];
