export default class PhaseHttpService {
  constructor($http, $q, $cookies) {
    this.$http = $http;
    this.$q = $q;
    this.$cookies = $cookies;
  }

  postPhase(tournamentId, phaseName) {
    return this.$q((resolve, reject) => {
      const body = {
        token: this.$cookies.get('nfToken'),
        name: phaseName,
      };
      this.$http.post(`/api/t/${tournamentId}/phases`, body)
        .then(({ data }) => resolve(data.result))
        .catch(error => reject(error));
    });
  }

  editPhase(tournamentId, phaseId, newName) {
    return this.$q((resolve, reject) => {
      const body = {
        token: this.$cookies.get('nfToken'),
        newName,
      };
      this.$http.put(`/api/t/${tournamentId}/phases/${phaseId}`, body)
        .then(({ data }) => resolve(data.result))
        .catch(error => reject(error));
    });
  }

  getPhases(tournamentId) {
    return this.$q((resolve, reject) => {
      const token = this.$cookies.get('nfToken');
      this.$http.get(`/api/t/${tournamentId}/phases?token=${token}`)
        .then(({ data }) => resolve(data.result))
        .catch(error => reject(error));
    });
  }

  deletePhase(tournamentId, phaseId) {
    return this.$q((resolve, reject) => {
      const token = this.$cookies.get('nfToken');
      this.$http.delete(`/api/t/${tournamentId}/phases/${phaseId}?token=${token}`)
        .then(({ data }) => resolve(data.result))
        .catch(err => reject(err));
    });
  }

  updateActivePhase(tournamentId, phaseId) {
    return this.$q((resolve, reject) => {
      const body = {
        token: this.$cookies.get('nfToken'),
      };
      this.$http.put(`/api/t/${tournamentId}/phases/${phaseId}/active`, body)
        .then(({ data }) => resolve(data.result.active_phase_id))
        .catch(err => reject(err));
    });
  }
}

PhaseHttpService.$inject = ['$http', '$q', '$cookies'];
