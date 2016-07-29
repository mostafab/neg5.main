(() => {
    
    angular.module('tournamentApp')
        .controller('ConfigCtrl', ['$scope', 'Tournament', 'Game', ConfigCtrl]);
    
    function ConfigCtrl($scope, Tournament, Game) {
        
        let vm = this;

        vm.editingPointScheme = false;
        vm.editingRules = false;

        vm.pointScheme = Tournament.pointScheme;
        vm.rules = Tournament.rules;

        vm.rulesCopy = {};
        vm.pointSchemeCopy = {
            tossupValues: []
        };
        vm.newPointValue = {type: null};

        vm.games = Game.games;

        vm.resetPointSchemeCopyToOriginal = () => {
            angular.copy(vm.pointScheme, vm.pointSchemeCopy);
            vm.pointSchemeCopy.tossupValues.sort((first, second) => first.value - second.value);
        }

        vm.editPointScheme = () => {
            if (!duplicatePointValues() && vm.editPointSchemeForm.$valid) {
                let toastConfig = {
                    message: 'Saving point values'
                }
                $scope.toast(toastConfig);
                Tournament.postPointValues($scope.tournamentId, vm.pointSchemeCopy)
                    .then(() => {
                        vm.resetPointSchemeCopyToOriginal();
                        vm.editingPointScheme = false;

                        toastConfig.message = 'Saved point values';
                        toastConfig.success = true;
                    })
                    .catch(error => {
                        toastConfig.message = 'Could not save point values';
                        toastConfig.success = false;
                    })
                    .finally(() => {
                        toastConfig.hideAfter = true;
                        $scope.toast(toastConfig);
                    });
            }
        }

        vm.addNewPointValue = () => {
            if (vm.newPointValue.type && vm.newPointValue.value && vm.newPointValueForm.$valid) {
                let toastConfig = {
                    message: 'Adding point value'
                }
                $scope.toast(toastConfig);
                Tournament.addPointValue($scope.tournamentId, vm.newPointValue)
                    .then((response) => {
                        vm.resetPointSchemeCopyToOriginal();
                        toastConfig.message = 'Added point value';
                        toastConfig.success = true;
                        vm.newPointValue = {};
                    })
                    .catch(error => {
                        toastConfig.message = 'Could not add point value';
                        toastConfig.success = false;
                    })
                    .finally(() => {
                        toastConfig.hideAfter = true;
                        $scope.toast(toastConfig);
                    })
            }
        }

        vm.removeFromPointSchemeCopy = (point) => {
            vm.pointSchemeCopy.tossupValues = vm.pointSchemeCopy.tossupValues.filter(ps => ps.value !== point.value && ps.type !== point.type);
        }

        let duplicatePointValues = () => {
            let checked = {};
            for (let i = 0; i < vm.pointSchemeCopy.tossupValues.length; i++) {
                if (checked[vm.pointSchemeCopy.tossupValues[i].value]) {
                    return true;
                }
                checked[vm.pointSchemeCopy.tossupValues[i].value] = true;
            }
            return false;
        }

        angular.copy(vm.pointScheme, vm.pointSchemeCopy);
        angular.copy(vm.rules, vm.rulesCopy);

    }
    
})();