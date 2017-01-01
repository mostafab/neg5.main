import angular from 'angular';

export default class TeamService {
  constructor($q, TeamHttpService) {
    this.$q = $q;
    this.TeamHttpService = TeamHttpService;

    this.teams = [];
    this.currentTeam = {
      newName: '',
      name: '',
      editingName: '',
    };
    this.newTeam = {
      name: '',
      players: [
        { name: '' },
        { name: '' },
        { name: '' },
        { name: '' },
      ],
      divisions: {},
    };
  }

  addPlayerSlotToNewTeam() {
    this.newTeam.players.push({ name: '' });
  }

  removePlayerSlotFromNewTeam(index) {
    this.newTeam.players.splice(index, 1);
  }

  emptyCurrentTeam() {
    angular.copy({
      newName: '',
      name: '',
      editingName: '',
    }, this.currentTeam);
  }

  resetCurrentTeam(name = this.currentTeam.name) {
    this.currentTeam.newName = name;
    this.currentTeam.name = name;
    this.currentTeam.editingName = false;
  }

  resetNewTeam() {
    this.newTeam.name = '';
    angular.copy([
      { name: '' },
      { name: '' },
      { name: '' },
      { name: '' },
    ], this.newTeam.players);
    angular.copy({}, this.newTeam.divisions);
  }

  resetPlayer(player, newName = player.name) {
    const template = {
      name: newName,
      newName,
      editing: false,
    };
    angular.copy(template, player);
  }

  getTeams(tournamentId) {
    return this.$q((resolve, reject) => {
      this.TeamHttpService.getTeams(tournamentId)
        .then((teams) => {
          const formattedTeams = TeamService.formatTeams(teams);
          angular.copy(formattedTeams, this.teams);
          resolve(formattedTeams);
        })
        .catch(error => reject(error));
    });
  }

  postTeam(tournamentId) {
    return this.$q((resolve, reject) => {
      const formattedTeam = TeamService.formatNewTeam(this.newTeam);
      this.TeamHttpService.postTeam(tournamentId, formattedTeam)
        .then((teamName) => {
          this.getTeams(tournamentId);
          this.resetNewTeam();
          resolve(teamName);
        })
        .catch(error => reject(error));
    });
  }

  getTeamById(tournamentId, teamId) {
    return this.$q((resolve, reject) => {
      this.TeamHttpService.getTeamById(tournamentId, teamId)
        .then((team) => {
          const formatted = TeamService.formatFetchedTeam(team);
          angular.copy(formatted, this.currentTeam);
          resolve(formatted);
        })
        .catch(error => reject(error));
    });
  }

  editTeamName(tournamentId, teamId, teamName) {
    return this.$q((resolve, reject) => {
      if (!this.isUniqueTeamName(teamId, teamName)) {
        reject({ reason: 'Another team already has this name.' });
      } else {
        this.TeamHttpService.editTeamName(tournamentId, teamId, teamName)
          .then(({ id, name }) => {
            this.updateTeamNameInArray(id, name);
            this.resetCurrentTeam(name);
            return resolve(name);
          })
          .catch(error => reject(error));
      }
    });
  }

  updateCurrentTeamDivisions(tournamentId) {
    return this.$q((resolve, reject) => {
      const divisionIds = Object.keys(this.currentTeam.mappedDivisions)
        .map(phaseId => this.currentTeam.mappedDivisions[phaseId]);
      this.updateTeamDivisions(tournamentId, this.currentTeam.id, this.currentTeam.mappedDivisions,
        divisionIds)
        .then(() => resolve())
        .catch(err => reject(err));
    });
  }

  updateTeamDivisions(tournamentId, teamId, phaseDivisionMap, divisions) {
    return this.$q((resolve, reject) => {
      this.TeamHttpService.updateTeamDivisions(tournamentId, teamId, divisions)
        .then(() => {
          this.updateTeamDivisionsInArray(teamId, phaseDivisionMap);
          resolve();
        })
        .catch(error => reject(error));
    });
  }

  editTeamPlayerName(tournamentId, playerId, name) {
    return this.$q((resolve, reject) => {
      this.TeamHttpService.editTeamPlayerName(tournamentId, playerId, name)
        .then(newName => resolve(newName))
        .catch(error => reject(error));
    });
  }

  addPlayer(tournamentId, teamId, newPlayerName) {
    return this.$q((resolve, reject) => {
      this.TeamHttpService.addPlayer(tournamentId, teamId, newPlayerName)
        .then(newPlayer => resolve(newPlayer))
        .catch(error => reject(error));
    });
  }

  deletePlayer(tournamentId, playerId) {
    return this.$q((resolve, reject) => {
      this.TeamHttpService.deletePlayer(tournamentId, playerId)
        .then(deletedPlayerId => resolve(deletedPlayerId))
        .catch(error => reject(error));
    });
  }

  deleteTeam(tournamentId, teamId) {
    return this.$q((resolve, reject) => {
      this.TeamHttpService.deleteTeam(tournamentId, teamId)
        .then((deletedTeam) => {
          this.deleteTeamFromArray(deletedTeam.id);
          resolve(deletedTeam);
        })
        .catch(error => reject(error));
    });
  }

  deleteTeamFromArray(teamId) {
    const index = this.teams.findIndex(team => team.id === teamId);
    this.teams.splice(index, 1);
  }

  updateTeamDivisionsInArray(teamId, divisions) {
    const index = this.teams.findIndex(team => team.id === teamId);
    if (index !== -1) {
      this.teams[index].divisions = divisions;
    }
  }

  updateTeamNameInArray(id, name) {
    const index = this.teams.findIndex(team => team.id === id);
    if (index !== -1) {
      this.teams[index].name = name;
    }
  }

  isUniqueTeamName(id, name) {
    const formattedName = name.trim().toLowerCase();
    return !this.teams.some(team =>
      team.id !== id && team.name.trim().toLowerCase() === formattedName);
  }

  static formatTeams(teams) {
    return teams.map((team) => {
      const { team_id: id, name, team_divisions: divisions } = team;
      return {
        id,
        name,
        divisions: divisions === null ? {} : divisions.reduce((phaseMap, current) => {
          phaseMap[current.phase_id] = current.division_id;
          return phaseMap;
        }, {}),
      };
    });
  }

  static formatFetchedTeam(team) {
    const { name, id, players, team_divisions: divisions,
      added_by: addedBy, games_count: games } = team;
    const formattedTeam = {
      name,
      newName: name,
      id,
      players: players.map(p => (
        {
          name: p.player_name,
          newName: p.player_name,
          id: p.player_id,
          addedBy: p.added_by,
          games: p.games,
        }
      )),
      mappedDivisions: divisions.reduce((aggr, current) => {
        aggr[current.phase_id] = current.division_id;
        return aggr;
      }, {}),
      addedBy,
      games,
    };
    return formattedTeam;
  }

  static formatNewTeam(team) {
    const formattedTeam = {};
    formattedTeam.players = team.players.filter(player => player.name.trim().length > 0);
    formattedTeam.name = team.name.trim();
    formattedTeam.divisions = Object.keys(team.divisions).map(phase => team.divisions[phase].id);
    return formattedTeam;
  }
}

TeamService.$inject = ['$q', 'TeamHttpService'];
