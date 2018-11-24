export default class PoolsController {

  static get $inject() {
    return ['DivisionService', 'TeamService', 'PhaseService'];
  }

  constructor(DivisionService, TeamService, PhaseService) {
    this.DivisionService = DivisionService;
    this.TeamService = TeamService;
    this.PhaseService = PhaseService;
  }
};
