export default class TeamHttpService {
  constructor($q, $http, $cookies) {
    this.$q = $q;
    this.$http = $http;
    this.$cookies = $cookies;
  }

  getTeams(tournamentId) {
    return this.$q((resolve, reject) => {
      const token = this.$cookies.get('nfToken');
      this.$http.get(`/api/t/${tournamentId}/teams?token=${token}`)
        .then(({ data }) => resolve(data.teams))
        .catch(error => reject(error));
    });
  }

  postTeam(tournamentId, team) {
    return this.$q((resolve, reject) => {
      const body = {
        team,
        token: this.$cookies.get('nfToken'),
      };
      this.$http.post(`/api/t/${tournamentId}/teams`, body)
        .then(({ data }) => resolve(data.team.team.name))
        .catch(error => reject(error));
    });
  }

  getTeamById(tournamentId, teamId) {
    return this.$q((resolve, reject) => {
      const token = this.$cookies.get('nfToken');
      this.$http.get(`/api/t/${tournamentId}/teams/${teamId}?token=${token}`)
        .then(({ data }) => resolve(data.result))
        .catch(error => reject(error));
    });
  }

  editTeamName(tournamentId, teamId, teamName) {
    return this.$q((resolve, reject) => {
      const body = {
        token: this.$cookies.get('nfToken'),
        name: teamName,
      };
      this.$http.put(`/api/t/${tournamentId}/teams/${teamId}`, body)
        .then(({ data }) => resolve(data.result))
        .catch(error => reject(error));
    });
  }

  updateTeamDivisions(tournamentId, teamId, divisions) {
    return this.$q((resolve, reject) => {
      const body = {
        token: this.$cookies.get('nfToken'),
        divisions,
      };
      this.$http.put(`/api/t/${tournamentId}/teams/${teamId}/divisions`, body)
        .then(() => resolve(teamId))
        .catch(error => reject(error));
    });
  }

  editTeamPlayerName(tournamentId, playerId, name) {
    return this.$q((resolve, reject) => {
      const body = {
        token: this.$cookies.get('nfToken'),
        name,
      };
      this.$http.put(`/api/t/${tournamentId}/players/${playerId}`, body)
        .then(({ data }) => resolve(data.result.name))
        .catch(error => reject(error));
    });
  }

  addPlayer(tournamentId, teamId, newPlayerName) {
    return this.$q((resolve, reject) => {
      const body = {
        token: this.$cookies.get('nfToken'),
        name: newPlayerName,
        team: teamId,
      };
      this.$http.post(`/api/t/${tournamentId}/players`, body)
          .then(({ data }) => resolve(data.result))
          .catch(error => reject(error));
    });
  }

  deletePlayer(tournamentId, playerId) {
    return this.$q((resolve, reject) => {
      const token = this.$cookies.get('nfToken');
      this.$http.delete(`/api/t/${tournamentId}/players/${playerId}?token=${token}`)
        .then(({ data }) => resolve(data.result.id))
        .catch(error => reject(error));
    });
  }

  deleteTeam(tournamentId, teamId) {
    return this.$q((resolve, reject) => {
      const token = this.$cookies.get('nfToken');
      this.$http.delete(`/api/t/${tournamentId}/teams/${teamId}?token=${token}`)
        .then(({ data }) => resolve(data.result.id))
        .catch(error => reject(error));
    });
  }
}

TeamHttpService.$inject = ['$q', '$http', '$cookies'];
