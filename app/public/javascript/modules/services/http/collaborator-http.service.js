export default class CollaboratorHttpService {
  constructor($q, $http, $cookies) {
    this.$q = $q;
    this.$http = $http;
    this.$cookies = $cookies;
  }

  postCollaborator(tournamentId, username, isAdmin) {
    return this.$q((resolve, reject) => {
      const token = this.$cookies.get('nfToken');
      const body = {
        token,
        username,
        admin: isAdmin,
      };
      this.$http.post(`/api/t/${tournamentId}/collaborators`, body)
        .then(({ data }) => resolve(data.result))
        .catch(err => reject(err));
    });
  }

  getCollaborators(tournamentId) {
    return this.$q((resolve, reject) => {
      const token = this.$cookies.get('nfToken');
      this.$http.get(`/api/t/${tournamentId}/collaborators?token=${token}`)
        .then(({ data }) => resolve(data.result))
        .catch(err => reject(err));
    });
  }

  updateCollaborator(tournamentId, username, isAdmin) {
    return this.$q((resolve, reject) => {
      const token = this.$cookies.get('nfToken');
      const body = {
        admin: isAdmin,
        token,
      };
      this.$http.put(`/api/t/${tournamentId}/collaborators/${username}`, body)
        .then(({ data }) => resolve(data.result))
        .catch(err => reject(err));
    });
  }

  deleteCollaborator(tournamentId, username) {
    return this.$q((resolve, reject) => {
      const token = this.$cookies.get('nfToken');
      this.$http.delete(`/api/t/${tournamentId}/collaborators/${username}?token=${token}`)
        .then(({ data }) => resolve(data.result))
        .catch(err => reject(err));
    });
  }

  findUsers(search) {
    return this.$q((resolve, reject) => {
      const token = this.$cookies.get('nfToken');
      this.$http.get(`/api/users?token=${token}&search=${search}`)
        .then(({ data }) => resolve(data))
        .catch(err => reject(err));
    });
  }
}

CollaboratorHttpService.$inject = ['$q', '$http', '$cookies'];

