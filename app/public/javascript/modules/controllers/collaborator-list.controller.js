export default class CollaboratorListController {
  constructor($scope, CollaboratorService) {
    this.$scope = $scope;
    this.$scope.tournamentId = this.$scope.$parent.tournamentId;
    this.$scope.toast = this.$scope.$parent.toast;
    this.CollaboratorService = CollaboratorService;
    this.collaborators = this.CollaboratorService.collaborators;

    this.CollaboratorService.getCollaborators(this.$scope.tournamentId);
  }

  toggleAdmin(collaborator) {
    this.CollaboratorService.toggleCollaboratorPermissions(this.$scope.tournamentId, collaborator)
      .catch(() => {
        this.$scope.toast({
          message: `Could not update ${collaborator.username}'s permissions.`,
          success: false,
        });
      });
  }

  removeCollaborator(username) {
    this.CollaboratorService.removeCollaborator(this.$scope.tournamentId, username)
      .catch(() => {
        this.$scope.toast({
          message: `Could not remove ${username} from the tournament.`,
          success: false,
        });
      });
  }
}

CollaboratorListController.$inject = ['$scope', 'CollaboratorService'];
