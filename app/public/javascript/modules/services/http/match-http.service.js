export default class MatchHttpService {
  constructor($q, $http, $cookies) {
    this.$q = $q;
    this.$http = $http;
    this.$cookies = $cookies;
  }

  postMatch(tournamentId, game) {
    return this.$q((resolve, reject) => {
      const body = {
        token: this.$cookies.get('nfToken'),
        game,
      };
      this.$http.post(`/api/t/${tournamentId}/matches`, body)
        .then(({ data }) => resolve(data.result))
        .catch(error => reject(error));
    });
  }

  getMatches(tournamentId) {
    return this.$q((resolve, reject) => {
      const token = this.$cookies.get('nfToken');
      this.$http.get(`/api/t/${tournamentId}/matches?token=${token}`)
        .then(({ data }) => resolve(data.matches))
        .catch(error => reject(error));
    });
  }

  getTeamPlayers(tournamentId, teamId) {
    return this.$q((resolve, reject) => {
      const token = this.$cookies.get('nfToken');
      this.$http.get(`/api/t/${tournamentId}/teams/${teamId}?token=${token}`)
        .then(({ data }) => resolve(data.result))
        .catch(error => reject(error));
    });
  }

  getMatchById(tournamentId, matchId) {
    return this.$q((resolve, reject) => {
      const token = this.$cookies.get('nfToken');
      this.$http.get(`/api/t/${tournamentId}/matches/${matchId}?token=${token}`)
        .then(({ data }) => resolve(data.result))
        .catch(error => reject(error));
    });
  }

  editMatch(tournamentId, matchId, matchInformation) {
    return this.$q((resolve, reject) => {
      const body = {
        token: this.$cookies.get('nfToken'),
        game: matchInformation,
      };
      this.$http.put(`/api/t/${tournamentId}/matches/${matchId}`, body)
        .then(({ data }) => resolve(data.result))
        .catch(error => reject(error));
    });
  }

  deleteMatch(tournamentId, matchId) {
    return this.$q((resolve, reject) => {
      const token = this.$cookies.get('nfToken');
      this.$http.delete(`/api/t/${tournamentId}/matches/${matchId}?token=${token}`)
        .then(({ data }) => resolve(data.result.id))
        .catch(error => reject(error));
    });
  }
}

MatchHttpService.$inject = ['$q', '$http', '$cookies'];
