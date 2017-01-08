export default class TeamController {
  constructor($scope, TeamService, MatchService, DivisionService, PhaseService) {
    this.$scope = $scope;
    this.TeamService = TeamService;
    this.MatchService = MatchService;
    this.DivisionService = DivisionService;
    this.PhaseService = PhaseService;

    this.$scope.tournamentId = this.$scope.$parent.tournamentId;
    this.$scope.toast = this.$scope.$parent.toast;

    this.teams = this.TeamService.teams;
    this.phases = this.PhaseService.phases;
    this.divisions = this.DivisionService.divisions;
    this.games = MatchService.games;

    this.emptyCurrentTeam = this.TeamService.emptyCurrentTeam;
    this.resetCurrentTeam = this.TeamService.resetCurrentTeam;
    this.getDivisionNameInPhase = this.TeamService.getDivisionNameInPhase;
    this.newTeam = this.TeamService.newTeam;
    this.currentTeam = this.TeamService.currentTeam;
    this.removePlayerSlot = this.TeamService.removePlayerSlotFromNewTeam;
    this.addPlayer = this.TeamService.addPlayerSlotToNewTeam;

    this.teamSortType = 'name';
    this.teamSortReverse = false;
    this.teamQuery = '';

    this.TeamService.getTeams(this.$scope.tournamentId);
  }

  getTournamentTeams() {
    this.TeamService.getTeams(this.$scope.tournamentId);
  }

  addTeam() {
    if (this.newTeamForm.$valid) {
      const toastConfig = {
        message: `Adding team: ${this.newTeam.name}.`,
      };
      this.$scope.toast(toastConfig);
      this.TeamService.postTeam(this.$scope.tournamentId)
        .then((teamName) => {
          toastConfig.message = `Added team: ${teamName}.`;
          toastConfig.success = true;
        })
        .catch(() => {
          toastConfig.message = 'Could not add team.';
          toastConfig.success = false;
        })
        .finally(() => {
          toastConfig.hideAfter = true;
          this.$scope.toast(toastConfig);
        });
    }
  }

  findTeam(team) {
    if (team.id !== this.currentTeam.id) {
      const toastConfig = {
        message: `Loading team: ${team.name}`,
      };
      this.$scope.toast(toastConfig);
      this.TeamService.getTeamById(this.$scope.tournamentId, team.id)
        .then((gottenTeam) => {
          toastConfig.success = true;
          toastConfig.message = `Loaded team: ${gottenTeam.name}`;
        })
        .catch(() => {
          toastConfig.success = false;
          toastConfig.message = `Could not load team: ${team.name}`;
        })
        .finally(() => {
          toastConfig.hideAfter = true;
          this.$scope.toast(toastConfig);
        });
    }
  }

  saveCurrentTeamName() {
    const { id, name, newName } = this.currentTeam;
    if (name !== newName && newName.length > 0) {
      const toastConfig = {
        message: `Editing team: ${name} \u2192 ${newName}`,
      };
      this.$scope.toast(toastConfig);
      this.TeamService.editTeamName(this.$scope.tournamentId, id, newName)
        .then((savedName) => {
          toastConfig.success = true;
          toastConfig.message = `Saved team name: ${name} \u2192 ${savedName}`;
        })
        .catch((err = {}) => {
          toastConfig.success = false;
          toastConfig.message = err.reason || `Could not update team name: ${name} \u2192 ${newName}`;
        })
        .finally(() => {
          toastConfig.hideAfter = true;
          this.$scope.toast(toastConfig);
        });
    } else {
      this.TeamService.resetCurrentTeam(name);
    }
  }

  saveCurrentTeamDivisions() {
    const name = this.currentTeam.name;
    const toastConfig = {
      message: `Updating divisions for: ${name}`,
    };
    this.$scope.toast(toastConfig);
    this.TeamService.updateCurrentTeamDivisions(this.$scope.tournamentId)
      .then(() => {
        toastConfig.success = true;
        toastConfig.message = `Updated divisions for: ${name}.`;
      })
      .catch(() => {
        toastConfig.success = false;
        toastConfig.message = `Could not update divisions for: ${name}`;
      })
      .finally(() => {
        toastConfig.hideAfter = true;
        this.$scope.toast(toastConfig);
      });
  }

  savePlayerNameOnCurrentTeam(player) {
    const { name, newName, id } = player;
    if (name !== newName && newName.length > 0) { // Angular automatically trims inputs
      const toastConfig = {
        message: `Editing player: ${name} \u2192 ${newName}`,
      };
      this.$scope.toast(toastConfig);
      this.TeamService.editCurrentTeamPlayer(this.$scope.tournamentId, id, newName)
        .then((savedName) => {
          toastConfig.success = true;
          toastConfig.message = `Saved player name: ${name} \u2192 ${savedName}`;
        })
        .catch((error = {}) => {
          toastConfig.success = false;
          toastConfig.message = error.reason || `Could not update player name: ${name}.`;
        })
        .finally(() => {
          toastConfig.hideAfter = true;
          this.$scope.toast(toastConfig);
        });
    } else {
      this.TeamService.resetPlayerOnCurrentTeam(player);
    }
  }

  addTeamPlayer() {
    const toastConfig = {
      message: 'Adding player.',
    };
    this.$scope.toast(toastConfig);
    this.TeamService.addPlayerToCurrentTeam(this.$scope.tournamentId)
      .then(({ name }) => {
        toastConfig.message = `Added player: ${name}.`;
        toastConfig.success = true;
      })
      .catch((err = {}) => {
        toastConfig.message = err.reason || 'Could not add player to team.';
        toastConfig.success = false;
      })
      .finally(() => {
        toastConfig.hideAfter = true;
        this.$scope.toast(toastConfig);
      });
  }

  removeCurrentTeamPlayer(player) {
    const toastConfig = { message: `Deleting player: ${player.name} ` };
    this.$scope.toast(toastConfig);
    this.TeamService.deletePlayerOnCurrentTeam(this.$scope.tournamentId, player)
      .then(() => {
        toastConfig.success = true;
        toastConfig.message = `Removed player: ${player.name}`;
      })
      .catch(() => {
        toastConfig.success = false;
        toastConfig.message = 'Could not remove player';
      })
      .finally(() => {
        toastConfig.hideAfter = true;
        this.$scope.toast(toastConfig);
      });
  }

  removeCurrentTeam() {
    const { name } = this.currentTeam;
    const toastConfig = { message: `Deleting team. ${name}` };
    this.$scope.toast(toastConfig);
    this.TeamService.deleteCurrentTeam(this.$scope.tournamentId)
      .then(() => {
        toastConfig.message = `Deleted team: ${name}`;
        toastConfig.success = true;
      })
      .catch(() => {
        toastConfig.message = `Could not delete team: ${name}.`;
        toastConfig.success = false;
      })
      .finally(() => {
        toastConfig.hideAfter = true;
        this.$scope.toast(toastConfig);
      });
  }

}

TeamController.$inject = ['$scope', 'TeamService', 'MatchService', 'DivisionService', 'PhaseService'];

