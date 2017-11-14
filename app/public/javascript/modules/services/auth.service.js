export default class AuthService {
  constructor($http, $q, $cookies) {
    this.$http = $http;
    this.$q = $q;
    this.$cookies = $cookies;
  }

  authenticate({ username, password }) {
    return this.$q((resolve, reject) => {
      this.$http.post('/api/account/authenticate', { username, password })
      .then(({ data }) => resolve(data.token))
      .catch(error => reject(error));
    });
  }

  register({ name, email, username, password }) {
    return this.$q((resolve, reject) => {
      this.$http.post('/api/account', { name, email, username, password })
        .then(({ data }) => resolve(data))
        .catch(error => reject(error));
    });
  }
}

AuthService.$inject = ['$http', '$q', '$cookies'];

