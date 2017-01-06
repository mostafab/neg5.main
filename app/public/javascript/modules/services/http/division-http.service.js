export default class DivisionHttpService {
  constructor($q, $http, $cookies) {
    this.$q = $q;
    this.$http = $http;
    this.$cookies = $cookies;
  }

  getDivisions(tournamentId) {
    return this.$q((resolve, reject) => {
      const token = this.$cookies.get('nfToken');
      this.$http.get(`/api/t/${tournamentId}/divisions?token=${token}`)
        .then(({ data }) => resolve(data.result))
        .catch(error => reject(error));
    });
  }

  editDivision(tournamentId, divisionId, newName) {
    return this.$q((resolve, reject) => {
      const body = {
        token: this.$cookies.get('nfToken'),
        newName,
      };
      this.$http.put(`/api/t/${tournamentId}/divisions/${divisionId}`, body)
        .then(({ data }) => resolve(data.result))
        .catch(error => reject(error));
    });
  }

  postDivision(tournamentId, name, phaseId) {
    return this.$q((resolve, reject) => {
      const body = {
        token: this.$cookies.get('nfToken'),
        name,
        phaseId,
      };
      this.$http.put(`/api/t/${tournamentId}/divisions`, body)
        .then(({ data }) => resolve(data.result))
        .catch(err => reject(err));
    });
  }

  deleteDivision(tournamentId, divisionId) {
    return this.$q((resolve, reject) => {
      const token = this.$cookies.get('nfToken');
      this.$http.delete(`/api/t/${tournamentId}/divisions/${divisionId}?token=${token}`)
        .then(({ data }) => resolve(data.result.id))
        .catch(err => reject(err));
    });
  }
}

DivisionHttpService.$inject = ['$q', '$http', '$cookies'];
