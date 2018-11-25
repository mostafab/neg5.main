export default class PoolsController {

  static get $inject() {
    return ['$scope', 'DivisionService', 'TeamService', 'PhaseService'];
  }

  constructor($scope, DivisionService, TeamService, PhaseService) {
    this.DivisionService = DivisionService;
    this.TeamService = TeamService;
    this.PhaseService = PhaseService;

    this.tournamentId = $scope.tournamentId;
  }

  onDropTeam(team, phase, division) {
    const divisionMap = {
      ...team.divisions,
    };
    divisionMap[phase.id] = division ? division.id : null;
    this.TeamService.updateTeamDivisions(this.tournamentId, team.id, divisionMap, Object.values(divisionMap))
  }

  addNewPool(phaseId) {
    this.DivisionService.addNewPool(this.tournamentId, phaseId);
  }

  addNewPhase() {
    this.PhaseService.postPhase(this.tournamentId);
  }

  resetDivision(divisionId) {
    this.DivisionService.resetEditingDivision(divisionId);
  }

  editDivision(division) {
    this.DivisionService.editDivision(this.tournamentId, division);
  }

  removeDivision(division) {
    this.DivisionService.removeDivision(this.tournamentId, division.id)
      .then(() => this.TeamService.getTeams(this.tournamentId));
  }
};
