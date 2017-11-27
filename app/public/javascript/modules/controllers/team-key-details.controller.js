export default class TeamKeyDetailsController {
  constructor(TeamKeyDetailsService) {
    this.TeamKeyDetailsService = TeamKeyDetailsService;
  }
}

TeamKeyDetailsController.$inject = ['TeamKeyDetailsService'];
