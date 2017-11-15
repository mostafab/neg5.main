export default class QBJHttpService {
  constructor($q, $http) {
    this.$q = $q;
    this.$http = $http;
  }

  getQBJReport(tournamentId) {
    return this.$q((resolve, reject) => {
      this.$http.get(`/api/t/${tournamentId}/qbj`)
        .then(({ data }) => {
          resolve(data);
        })
        .catch(error => reject(error));
    });
  }
}

QBJHttpService.$inject = ['$q', '$http'];

