export default class MatchKeyDetailsController {

  constructor(MatchKeyDetailsService) {
    this.MatchKeyDetailsService = MatchKeyDetailsService;
    console.log(this.MatchKeyDetailsService);
  }
};

MatchKeyDetailsController.$inject = ['MatchKeyDetailsService'];
