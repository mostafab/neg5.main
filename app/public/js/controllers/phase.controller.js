'use strict';

(function () {

    angular.module('tournamentApp').controller('PhaseCtrl', ['$scope', 'Phase', PhaseCtrl]);

    function PhaseCtrl($scope, Phase) {

        var vm = this;

        vm.phases = Phase.phases;
        vm.newPhase = '';

        vm.getPhases = function () {
            return Phase.getPhases($scope.tournamentId);
        };

        vm.addPhase = function () {
            return vm.phases.push({
                name: vm.newPhase,
                id: Math.random(),
                active: false
            });
        };

        vm.removePhase = function (id) {
            return console.log(id);
        };

        vm.savePhases = function () {
            console.log(vm.phases);
        };

        vm.activePhase = vm.phases.find(function (phase) {
            return phase.active;
        });

        // vm.getPhases();
    }
})();