export default class QBJHttpService {
  constructor($q, $http) {
    this.$q = $q;
    this.$http = $http;
  }

  getQBJReport(tournamentId) {
    return this.$q((resolve, reject) => {
      this.$http.get(`/api/t/${tournamentId}/qbj`)
        .then(({ data }) => {
          resolve(data.result);
        })
        .catch(error => reject(error));
    });
  }
}
