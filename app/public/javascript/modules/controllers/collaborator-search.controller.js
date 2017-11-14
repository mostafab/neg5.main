export default class CollaboratorSearchController {
  constructor($scope, $timeout, CollaboratorService) {
    this.$scope = $scope;
    this.$timeout = $timeout;
    this.CollaboratorService = CollaboratorService;
    this.$scope.tournamentId = this.$scope.$parent.tournamentId;
    this.$scope.toast = this.$scope.$parent.toast;

    this.searchResults = this.CollaboratorService.searchResults;
    this.searchQuery = this.CollaboratorService.searchQuery;
    this.timeoutRequest = null;
    this.resetSearch = this.CollaboratorService.resetSearch;

    this.TIMEOUT_LENGTH_MS = 333;
    this.MINIMUM_SEARCH_LENGTH = 2;
  }

  handleKeyPress() {
    if (this.searchQuery.query.trim().length >= this.MINIMUM_SEARCH_LENGTH) {
      if (this.timeoutRequest) {
        this.$timeout.cancel(this.timeoutRequest);
      }
      this.timeoutRequest = this.$timeout(() => {
        this.CollaboratorService.findCollaborators();
        this.timeoutRequest = null;
      }, this.TIMEOUT_LENGTH_MS);
    }
  }

  addCollaborator(username, isAdmin) {
    this.CollaboratorService.addCollaborator(this.$scope.tournamentId, username, isAdmin)
      .catch(() => {
        const toastConfig = {
          message: `Could not add ${username} as a collaborator.`,
          success: false,
        };
        this.$scope.toast(toastConfig);
      });
  }
}

CollaboratorSearchController.$inject = ['$scope', '$timeout', 'CollaboratorService'];
