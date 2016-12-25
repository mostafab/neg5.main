/* global describe it expect beforeEach inject */

describe('Controller: Match', () => {
  let controller;
  let $scope;
  let PhaseController;

  beforeEach(module('tournamentApp'));

  beforeEach(inject(($rootScope, $controller) => {
    $scope = $rootScope.$new();
    controller = $controller;
    PhaseController = controller('PhaseCtrl', { $scope });
  }));

  describe('PhaseController() | Controller should be initialized properly', () => {
    it('and should be defined', () => {
      expect(PhaseController).toBeDefined();
    });
    it('and new phase name should be an empty string', () => {
      expect(PhaseController.newPhase.length).toEqual(0);
    });
  });

  describe('PhaseController.phaseNameWasChanged | Check edit phase name logic', () => {
    let phase;
    beforeEach(() => {
      phase = {};
    });

    it(' and it should return true when new phase name and old phase name are different', () => {
      phase.name = 'Old Phase';
      phase.newName = 'New Phase';
      expect(PhaseController.phaseNameWasChanged(phase)).toBe(true);
    });

    it(' and it should return true when new phase name and old phase name are same but new name is lower case', () => {
      phase.name = 'Old Phase';
      phase.newName = 'old phase';
      expect(PhaseController.phaseNameWasChanged(phase)).toBe(true);
      phase.newName = 'old Phase';
      expect(PhaseController.phaseNameWasChanged(phase)).toBe(true);
    });

    it(' and it should return false when new phase name and old phase name are the same', () => {
      phase.name = 'Old Phase';
      phase.newName = 'Old Phase';
      expect(PhaseController.phaseNameWasChanged(phase)).toBe(false);
    });

    it(' and it should return false when new phase name and old phase name are the same but new name has trailing white space', () => {
      phase.name = 'Old Phase';
      phase.newName = 'Old Phase    ';

      expect(PhaseController.phaseNameWasChanged(phase)).toBe(false);

      phase.newName = '  Old Phase';
      expect(PhaseController.phaseNameWasChanged(phase)).toBe(false);
    });

    it(' and it should return false if new phase name length is 0 and true otherwise assuming old and new are not the same', () => {
      phase.name = 'Old Phase';
      phase.newName = '';
      expect(PhaseController.phaseNameWasChanged(phase)).toBe(false);
      phase.newName = 'New Phase';
      expect(PhaseController.phaseNameWasChanged(phase)).toBe(true);
    });

    it('and should return true if new name has different capitalization', () => {
      phase.name = 'Old Phase';
      phase.newName = 'old phase';
      expect(PhaseController.phaseNameWasChanged(phase)).toBe(true);
    });
  });

  describe('PhaseController.isValidNewPhaseName | Check adding new phase logic', () => {
    let phase;
    beforeEach(() => {
      phase = {};
      PhaseController.phases = [
          { name: 'Prelim' },
          { name: 'Playoff' },
      ];
    });

    it('and should return true if phase name length is greater than 0 and is not the same as another phase name', () => {
      phase.name = 'Next Phase';
      expect(PhaseController.isValidNewPhaseName(phase.name)).toBe(true);
    });

    it('and should return false if phase name length (trimmed) is 0', () => {
      phase.name = '';
      expect(PhaseController.isValidNewPhaseName(phase.name)).toBe(false);
      phase.name = ' ';
      expect(PhaseController.isValidNewPhaseName(phase.name)).toBe(false);
    });

    it('and should return false if phase name is already in the existing phases', () => {
      phase.name = 'Prelim';
      expect(PhaseController.isValidNewPhaseName(phase.name)).toBe(false);
      phase.name = 'prelim';
      expect(PhaseController.isValidNewPhaseName(phase.name)).toBe(false);
      phase.name = 'prelim   ';
      expect(PhaseController.isValidNewPhaseName(phase.name)).toBe(false);
    });
  });
});
