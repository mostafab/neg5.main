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

        vm.editPhase = function (phase) {
            var formattedNewName = phase.newName.trim();
            var formattedOldName = phase.name.trim();
            if (formattedNewName !== formattedOldName && formattedNewName.length > 0) {
                (function () {
                    var toastConfig = {
                        message: 'Editing phase.'
                    };
                    Phase.editPhase($scope.tournamentId, formattedNewName, phase.id).then(function (newName) {

                        phase.newName = newName;
                        phase.name = newName;
                        phase.editing = false;

                        toastConfig.message = 'Saved phase';
                        toastConfig.success = true;
                    }).catch(function () {
                        toastConfig.message = 'Couldn\'t update phase';
                        toastConfig.success = false;
                    }).finally(function () {
                        toastConfig.hideAfter = true;
                        $scope.toast(toastConfig);
                    });
                })();
            } else {
                phase.editing = false;
            }
        };

        vm.activePhase = vm.phases.find(function (phase) {
            return phase.active;
        });

        vm.getPhases();
    }
})();