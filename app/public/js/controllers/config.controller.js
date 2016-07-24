'use strict';

(function () {

    angular.module('tournamentApp').controller('ConfigCtrl', ['$scope', 'Tournament', 'Game', ConfigCtrl]);

    function ConfigCtrl($scope, Tournament, Game) {

        var vm = this;

        vm.editingPointScheme = false;
        vm.pointScheme = Tournament.pointScheme;

        vm.pointSchemeCopy = [];
        vm.newPointValue = { type: null };

        vm.games = Game.games;

        vm.resetPointSchemeCopyToOriginal = function () {
            angular.copy(vm.pointScheme, vm.pointSchemeCopy);
            vm.pointSchemeCopy.sort(function (first, second) {
                return first.value - second.value;
            });
        };

        vm.editPointScheme = function () {
            if (!duplicatePointValues()) {
                (function () {
                    var toastConfig = {
                        message: 'Saving point values'
                    };
                    $scope.toast(toastConfig);
                    Tournament.postPointValues($scope.tournamentId, vm.pointSchemeCopy).then(function (newPointValue) {
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
            vm.pointSchemeCopy = vm.pointSchemeCopy.filter(function (ps) {
                return ps.value !== point.value && ps.type !== point.type;
            });
        };

        var duplicatePointValues = function duplicatePointValues() {
            var checked = {};
            for (var i = 0; i < vm.pointSchemeCopy.length; i++) {
                if (checked[vm.pointSchemeCopy[i].value]) {
                    return true;
                }
                checked[vm.pointSchemeCopy[i].value] = true;
            }
            return false;
        };

        angular.copy(vm.pointScheme, vm.pointSchemeCopy);
    }
})();