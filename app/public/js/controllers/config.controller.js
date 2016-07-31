'use strict';

(function () {

    angular.module('tournamentApp').controller('ConfigCtrl', ['$scope', 'Tournament', 'Game', 'Division', 'Phase', ConfigCtrl]);

    function ConfigCtrl($scope, Tournament, Game, Division, Phase) {

        var vm = this;

        vm.editingPointScheme = false;
        vm.editingRules = false;

        vm.pointScheme = Tournament.pointScheme;
        vm.rules = Tournament.rules;

        vm.rulesCopy = {};
        vm.pointSchemeCopy = {
            tossupValues: []
        };
        vm.newPointValue = { type: null };
        vm.newDivision = { name: '' };

        vm.games = Game.games;
        vm.divisions = Division.divisions;
        vm.phases = Phase.phases;

        vm.resetPointSchemeCopyToOriginal = function () {
            angular.copy(vm.pointScheme, vm.pointSchemeCopy);
            vm.pointSchemeCopy.tossupValues.sort(function (first, second) {
                return first.value - second.value;
            });
        };

        vm.editPointScheme = function () {
            if (!duplicatePointValues() && vm.editPointSchemeForm.$valid) {
                (function () {
                    var toastConfig = {
                        message: 'Saving point values'
                    };
                    $scope.toast(toastConfig);
                    Tournament.postPointValues($scope.tournamentId, vm.pointSchemeCopy).then(function () {
                        vm.resetPointSchemeCopyToOriginal();
                        vm.editingPointScheme = false;

                        toastConfig.message = 'Saved point values';
                        toastConfig.success = true;
                    }).catch(function (error) {
                        toastConfig.message = 'Could not save point values';
                        toastConfig.success = false;
                    }).finally(function () {
                        toastConfig.hideAfter = true;
                        $scope.toast(toastConfig);
                    });
                })();
            }
        };

        vm.addNewPointValue = function () {
            if (vm.newPointValue.type && vm.newPointValue.value && vm.newPointValueForm.$valid) {
                (function () {
                    var toastConfig = {
                        message: 'Adding point value'
                    };
                    $scope.toast(toastConfig);
                    Tournament.addPointValue($scope.tournamentId, vm.newPointValue).then(function (response) {
                        vm.resetPointSchemeCopyToOriginal();
                        toastConfig.message = 'Added point value';
                        toastConfig.success = true;
                        vm.newPointValue = {};
                    }).catch(function (error) {
                        toastConfig.message = 'Could not add point value';
                        toastConfig.success = false;
                    }).finally(function () {
                        toastConfig.hideAfter = true;
                        $scope.toast(toastConfig);
                    });
                })();
            }
        };

        vm.removeFromPointSchemeCopy = function (point) {
            vm.pointSchemeCopy.tossupValues = vm.pointSchemeCopy.tossupValues.filter(function (ps) {
                return ps.value !== point.value && ps.type !== point.type;
            });
        };

        vm.saveDivision = function (division) {
            var newName = division.newName.trim();
            if (division.name.trim() !== newName && newName.length !== 0) {
                (function () {
                    var toastConfig = {
                        message: 'Saving division.'
                    };
                    $scope.toast(toastConfig);
                    Division.editDivision($scope.tournamentId, division).then(function () {
                        toastConfig.success = true;
                        toastConfig.message = 'Updated division.';
                    }).catch(function (error) {
                        toastConfig.success = false, toastConfig.message = 'Could not update division.';
                    }).finally(function () {
                        toastConfig.hideAfter = true;
                        $scope.toast(toastConfig);
                        division.editing = false;
                    });
                })();
            } else {
                division.editing = false;
            }
        };

        vm.addNewDivision = function () {
            var newDivisionName = vm.newDivision.name.trim();
            if (newDivisionName.length > 0 && vm.newDivision.phaseId) {
                (function () {
                    var toastConfig = {
                        message: 'Adding division'
                    };
                    $scope.toast(toastConfig);
                    Division.addDivision($scope.tournamentId, newDivisionName, vm.newDivision.phaseId).then(function () {
                        toastConfig.message = 'Added division.';
                        toastConfig.success = true;
                        vm.newDivision = { name: '' };
                    }).catch(function (error) {
                        toastConfig.message = 'Could not add division';
                        toastConfig.success = false;
                    }).finally(function () {
                        toastConfig.hideAfter = true;
                        $scope.toast(toastConfig);
                    });
                })();
            }
        };

        var duplicatePointValues = function duplicatePointValues() {
            var checked = {};
            for (var i = 0; i < vm.pointSchemeCopy.tossupValues.length; i++) {
                if (checked[vm.pointSchemeCopy.tossupValues[i].value]) {
                    return true;
                }
                checked[vm.pointSchemeCopy.tossupValues[i].value] = true;
            }
            return false;
        };

        angular.copy(vm.pointScheme, vm.pointSchemeCopy);
        angular.copy(vm.rules, vm.rulesCopy);

        Division.getDivisions($scope.tournamentId);
    }
})();