/* global window */

import slug from 'slug';

slug.defaults.modes['rfc3986'] = {
  replacement: '-',      // replace spaces with replacement 
  symbols: true,         // replace unicode symbols or not 
  remove: null,          // (optional) regex to remove characters 
  lower: true,           // result in lower case 
  charmap: slug.charmap, // replace special characters 
  multicharmap: slug.multicharmap // replace multi-characters 
};

export default class HomeController {

  constructor($scope, $timeout, $cookies, TournamentService, SlugService) {
    this.$scope = $scope;
    this.$timeout = $timeout;
    this.$cookies = $cookies;
    this.TournamentService = TournamentService;
    this.SlugService = SlugService;

    this.tournaments = [];
    this.submittingForm = false;
    this.newTournament = {};

    this.loadingTournaments = false;

    this.toastPromise = null;
    this.query = {};

    this.$scope.toastMessage = null;
    this.$scope.logout = () => {
      this.$cookies.remove('nfToken');
      window.location = '/';
    };
    this.$scope.toast = this.toast.bind(this);

    this.getTournaments();
  }

  getTournaments() {
    const jwt = this.$cookies.get('nfToken');
    this.loadingTournaments = true;
    const toastConfig = {
      message: 'Loading your tournaments',
    };
    this.$scope.toast(toastConfig);
    this.TournamentService.getUserTournaments(jwt)
      .then((tournaments) => {
        this.tournaments = tournaments;
        toastConfig.success = true;
        toastConfig.message = `Loaded ${tournaments.length} tournaments`;
      })
      .catch(error => {
        toastConfig.success = false;
        toastConfig.message = 'Could not load tournaments.';
      })
      .finally(() => {
        toastConfig.hideAfter = true;
        this.loadingTournaments = false;
        this.$scope.toast(toastConfig);
      })
  }

  getTournamentSlug(tournament) {
    return this.SlugService.slugify(tournament.name);
  }

  createNewTournament() {
    const { $valid } = this.newTournamentForm;
    if ($valid) {
      const toastConfig = {
        message: `Adding tournament: ${this.newTournament.name}.`,
      };
      this.$scope.toast(toastConfig);
      this.submittingForm = true;
      const token = this.$cookies.get('nfToken');
      const name = this.newTournament.name;
      this.TournamentService.newTournament(name, token)
        .then((result) => {
          this.newTournament = {};
          toastConfig.success = true;
          toastConfig.message = `Added tournament: ${result.name}`;
          window.location = `/t/${result.id}/${this.getTournamentSlug(result)}`;
        })
        .catch(() => {
          toastConfig.success = false;
          toastConfig.message = 'Could not add tournament.';
        })
        .finally(() => {
          toastConfig.hideAfter = true;
          this.submittingForm = false;
          this.$scope.toast(toastConfig);
        });
    }
  }

  toast({ message, success = null, hideAfter }) {
    if (hideAfter) {
      if (this.toastPromise) {
        this.$timeout.cancel(this.toastPromise);
      }
      this.toastPromise = this.$timeout(() => {
        this.$scope.toastMessage = null;
        this.toastPromise = null;
      }, 3000);
    }
    this.$scope.toastMessage = {
      message,
      success,
    };
  }
}

HomeController.$inject = ['$scope', '$timeout', '$cookies', 'TournamentService', 'SlugService'];
