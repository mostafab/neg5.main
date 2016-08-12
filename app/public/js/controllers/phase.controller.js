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
            var phaseName = vm.newPhase.trim();
            if (vm.isValidNewPhaseName(phaseName)) {
                (function () {
                    var toastConfig = { message: 'Adding phase.' };
                    $scope.toast(toastConfig);
                    Phase.postPhase($scope.tournamentId, phaseName).then(function (phaseName) {
                        vm.newPhase = '';
                        toastConfig.success = true;
                        toastConfig.message = 'Added phase: ' + phaseName;
                    }).catch(function (error) {
                        toastConfig.success = false;
                        toastConfig.message = 'Couldn\'t add phase';
                    }).finally(function () {
                        toastConfig.hideAfter = true;
                        $scope.toast(toastConfig);
                    });
                })();
            }
        };

        vm.removePhase = function (id) {
            return console.log(id);
        };

        vm.editPhase = function (phase) {
            if (vm.phaseNameWasChanged(phase)) {
                (function () {
                    var toastConfig = {
                        message: 'Editing phase.'
                    };
                    var oldName = phase.name;
                    $scope.toast(toastConfig);
                    Phase.editPhase($scope.tournamentId, phase.newName.trim(), phase.id).then(function (newName) {

                        toastConfig.message = 'Updated phase: ' + oldName + ' → ' + newName;
                        toastConfig.success = true;

                        phase.newName = newName;
                        phase.name = newName;
                        phase.editing = false;
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

        vm.phaseNameWasChanged = function (phase) {
            var formattedNewName = phase.newName.trim();
            var formattedOldName = phase.name.trim();
            return formattedNewName !== formattedOldName && formattedNewName.length > 0;
        };

        vm.isValidNewPhaseName = function (phaseName) {
            phaseName = phaseName.toLowerCase();
            return phaseName.length > 0 && !vm.phases.some(function (phase) {
                return phase.name.toLowerCase() === phaseName;
            });
        };

        vm.getPhases();
    }
})();