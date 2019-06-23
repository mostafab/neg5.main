export const KEY = 'ScoresheetHttpService';

export default class ScoresheetHttpService {
  constructor($q, $http) {
    this.$q = $q;
    this.$http = $http;
  }

  saveScoresheet(tournamentId, scoresheet) {
    return this.$q((resolve, reject) => {
      const data = {
        ...scoresheet,
        tournamentId,
      }
      this.$http.post('/neg5-api/scoresheets', data)
        .then((response) => {
          console.log(response);
        })
        .catch(error => reject(error));
    });
  }
}

ScoresheetHttpService.$inject = ['$q', '$http'];

