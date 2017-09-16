import angular from 'angular';

export default class CollaboratorService {
  constructor($q, CollaboratorHttpService) {
    this.$q = $q;
    this.CollaboratorHttpService = CollaboratorHttpService;
    this.collaborators = [];
    this.searchResults = [];
    this.searchQuery = {
      query: '',
    };
  }

  resetSearch() {
    angular.copy([], this.searchResults);
    this.searchQuery.query = '';
  }

  getCollaborators(tournamentId) {
    return this.$q((resolve, reject) => {
      this.CollaboratorHttpService.getCollaborators(tournamentId)
        .then((foundCollaborators) => {
          const formatted = CollaboratorService.formatFoundCollaborators(foundCollaborators);
          angular.copy(formatted, this.collaborators);
          resolve(formatted);
        })
        .catch(err => reject(err));
    });
  }

  addCollaborator(tournamentId, username, isAdmin) {
    return this.$q((resolve, reject) => {
      this.CollaboratorHttpService.postCollaborator(tournamentId, username, isAdmin)
        .then((addedCollaborator) => {
          const formatted = CollaboratorService.formatAddedCollaborator(addedCollaborator);
          this.addCollaboratorToArray(formatted);
          this.removeCollaboratorFromSearchResults(username);
          resolve(formatted);
        })
        .catch(err => reject(err));
    });
  }

  updateCollaborator(tournamentId, username, isAdmin) {
    return this.$q((resolve, reject) => {
      this.CollaboratorHttpService.updateCollaborator(tournamentId, username, isAdmin)
        .then((updatedCollaborator) => {
          this.updateCollaboratorInArray(updatedCollaborator.username,
            updatedCollaborator.is_admin);
          resolve(updatedCollaborator);
        })
        .catch(err => reject(err));
    });
  }

  toggleCollaboratorPermissions(tournamentId, collaborator) {
    return this.$q((resolve, reject) => {
      const admin = !collaborator.admin;
      this.updateCollaborator(tournamentId, collaborator.username, admin)
        .then(updated => resolve(updated))
        .catch(err => reject(err));
    });
  }

  removeCollaborator(tournamentId, username) {
    return this.$q((resolve, reject) => {
      this.CollaboratorHttpService.deleteCollaborator(tournamentId, username)
        .then((deletedCollaborator) => {
          this.removeCollaboratorFromArray(deletedCollaborator.username);
          resolve(deletedCollaborator.username);
        })
        .catch(err => reject(err));
    });
  }
  
  findCollaborators() {
    return this.$q((resolve, reject) => {
      this.CollaboratorHttpService.findUsers(this.searchQuery.query)
        .then(({ currentUser, users }) => {
          const formatted = this.formatFoundUsers(users, currentUser);
          angular.copy(formatted, this.searchResults);
          resolve(formatted);
        })
        .catch(err => reject(err));
    });
  }

  addCollaboratorToArray(collaborator) {
    this.collaborators.push(collaborator);
  }

  removeCollaboratorFromArray(username) {
    const index = this.collaborators.findIndex(collab => collab.username === username);
    if (index !== -1) {
      this.collaborators.splice(index, 1);
    }
  }

  removeCollaboratorFromSearchResults(username) {
    const index = this.searchResults.findIndex(user => user.username === username);
    if (index !== -1) {
      this.searchResults.splice(index, 1);
    }
  }

  updateCollaboratorInArray(username, isAdmin) {
    const index = this.collaborators.findIndex(collab => collab.username === username);
    if (index !== -1) {
      this.collaborators[index].admin = isAdmin;
    }
  }

  formatFoundUsers(users, userWhoRequested) {
    const addedCollaboratorsSet = this.buildCollaboratorSet();
    return users.filter(user =>
      user.username !== userWhoRequested && !addedCollaboratorsSet[user.username]);
  }

  /* eslint-disable no-param-reassign */
  buildCollaboratorSet() {
    return this.collaborators.reduce((aggr, current) => {
      aggr[current.username] = true;
      return aggr;
    }, {});
  }

  static formatAddedCollaborator({ name, username, is_admin }) {
    return {
      name,
      username,
      admin: is_admin,
    }
  }

  static formatFoundCollaborators(collaborators) {
    return collaborators.map(({ name, username, is_admin: admin }) => ({
      name,
      username,
      admin,
    }));
  }
}


CollaboratorService.$inject = ['$q', 'CollaboratorHttpService'];
