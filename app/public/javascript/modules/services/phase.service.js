import angular from 'angular';
import Emittable from './../util/emittable';

import phaseActions from './../actions/phase.actions';

export default class PhaseService extends Emittable {
  constructor($q, TournamentService, PhaseHttpService) {
    super();
    this.$q = $q;
    this.TournamentService = TournamentService;
    this.PhaseHttpService = PhaseHttpService;

    this.activePhase = this.TournamentService.activePhase;
    this.phases = [];
    this.newPhase = {
      name: '',
    };
  }

  postPhase(tournamentId, phaseName = this.newPhase.name) {
    return this.$q((resolve, reject) => {
      if (this.isValidPhaseName(this.newPhase.name)) {
        this.PhaseHttpService.postPhase(tournamentId, phaseName)
          .then((addedPhase) => {
            this.addNewPhaseToArray(addedPhase);
            this.resetNewPhase();
            this.emit(phaseActions.phasesReceived, { phases: this.phases });
            if (this.phases.length === 1) {
              this.updateActivePhase(tournamentId, addedPhase.id)
                .then(resolve(addedPhase.name))
                .catch(err => reject(err));
            } else {
              resolve(addedPhase.name);
            }
          })
          .catch(err => reject(err));
      } else {
        reject({ reason: 'Invalid or duplicate phase name.' });
      }
    });
  }

  editPhase(tournamentId, phase) {
    return this.$q((resolve, reject) => {
      if (PhaseService.phaseWasChanged(phase) && this.isUniquePhaseName(phase)) {
        this.PhaseHttpService.editPhase(tournamentId, phase.id, phase.newName)
          .then(({ id, name }) => {
            this.updatePhaseInArray(id, name);
            this.emit(phaseActions.phasesReceived, { phases: this.phases });
            resolve(name);
          })
          .catch(err => reject(err));
      } else {
        reject({ reason: 'Invalid phase name or duplicate.' });
      }
    });
  }

  getPhases(tournamentId) {
    return this.$q((resolve, reject) => {
      this.PhaseHttpService.getPhases(tournamentId)
        .then((gottenPhases) => {
          const formatted = PhaseService.formatPhases(gottenPhases);
          angular.copy(formatted, this.phases);
          this.emit(phaseActions.phasesReceived, { phases: formatted });
          resolve(formatted);
        })
        .catch(err => reject(err));
    });
  }

  deletePhase(tournamentId, phaseId) {
    return this.$q((resolve, reject) => {
      this.PhaseHttpService.deletePhase(tournamentId, phaseId)
        .then(({ name, id }) => {
          this.removePhaseFromArray(id);
          this.emit(phaseActions.phasesReceived, { phases: this.phases });
          if ((this.phases.length > 0 && id === this.activePhase.id) // We're removing the currently active phase, so we need to reset the active phase to a remaining phase.
              || (this.phases.length === 1 && this.phases[0].id !== this.activePhase.id)) { // Left with one phase that is not active, so make it active.
                this.updateActivePhase(tournamentId, this.phases[0].id)
              .then(() => resolve(name));
          } else if (this.phases.length === 0) {
            this.updateActivePhaseObject(null);
            resolve(name);
          } else {
            resolve(name);
          }
        })
        .catch(err => reject(err));
    });
  }

  resetNewPhase() {
    this.newPhase.name = '';
  }

  isValidPhaseName(phaseName) {
    const formatted = phaseName ? phaseName.toLowerCase().trim() : ''
    return formatted
      && !this.phases.some(p => p.name.toLowerCase() === formatted);
  }

  addNewPhaseToArray({ name, id }) {
    this.phases.push({
      name,
      id,
      newName: name,
    });
  }

  removePhaseFromArray(phaseId) {
    const index = this.phases.findIndex(p => p.id === phaseId);
    if (index !== -1) {
      this.phases.splice(index, 1);
    }
  }

  updatePhaseInArray(phaseId, newPhaseName) {
    const index = this.phases.findIndex(phase => phase.id === phaseId);
    if (index !== -1) {
      this.phases[index].name = newPhaseName;
      this.phases[index].newName = newPhaseName;
      if (this.activePhase.id === phaseId) {
        this.updateActivePhaseObject(phaseId);
      }
    }
  }

  updateActivePhaseObject(phaseId) {
    const matchingPhase = this.phases.find(phase => phase.id === phaseId);
    this.activePhase.id = matchingPhase ? matchingPhase.id : null;
    this.activePhase.name = matchingPhase ? matchingPhase.name : null;
  }

  updateActivePhase(tournamentId, phaseId) {
    return this.$q((resolve, reject) => {
      if (this.activePhase.id !== phaseId) {
        this.PhaseHttpService.updateActivePhase(tournamentId, phaseId)
          .then((newActivePhaseId) => {
            this.updateActivePhaseObject(newActivePhaseId);
            resolve();
          })
          .catch(error => reject(error));
      }
    });
  }

  isUniquePhaseName(phase) {
    const { id: thisId, newName } = phase;
    const thisName = newName.toLowerCase().trim();
    for (let i = 0; i < this.phases.length; i++) {
      const { id: currentId, name: currentName } = this.phases[i];
      if (currentId !== thisId && thisName === currentName.toLowerCase().trim()) {
        return false;
      }
    }
    return true;
  }

  static phaseWasChanged(phase) {
    return phase.name.trim() !== phase.newName.trim() && phase.newName.trim().length > 0;
  }

  static formatPhases(phases) {
    return phases.map(({ name, id }) => (
      {
        name,
        newName: name,
        id,
      }
    ));
  }

}

PhaseService.$inject = ['$q', 'TournamentService', 'PhaseHttpService'];

