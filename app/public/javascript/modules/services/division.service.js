export default class DivisionService {
  constructor($q, DivisionHttpService, PhaseService) {
    this.$q = $q;
    this.DivisionHttpService = DivisionHttpService;
    this.PhaseService = PhaseService;

    this.phases = this.PhaseService.phases;
    this.divisions = [];
    this.newDivision = {
      name: '',
      phaseName: null,
      phaseId: null,
    };
  }

  isValidNewDivision() {
    return this.newDivision.name.trim().length > 0
      && this.newDivision.phaseName
      && this.newDivision.phaseName;
  }

  isUniqueNewDivisionNameInPhase(divisionName, phaseId) {
    const formatted = divisionName.trim().toLowerCase();
    return !this.divisions.some(d => d.phaseId === phaseId && formatted === divisionName);
  }

}

DivisionService.$inject = ['$q', 'DivisionHttpService', 'PhaseService'];

