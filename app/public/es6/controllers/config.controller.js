(() => {
    
    angular.module('tournamentApp')
        .controller('ConfigCtrl', ['$scope', 'Tournament', 'Game', 'Division', 'Phase', ConfigCtrl]);
    
    function ConfigCtrl($scope, Tournament, Game, Division, Phase) {
        
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
        vm.newDivision = {name: ''};

        vm.games = Game.games;
        vm.divisions = Division.divisions;
        vm.phases = Phase.phases;

        vm.resetPointSchemeCopyToOriginal = () => {
            angular.copy(vm.pointScheme, vm.pointSchemeCopy);
            vm.pointSchemeCopy.tossupValues.sort((first, second) => first.value - second.value);
        }

        vm.resetRules = () => {
            angular.copy(vm.rules, vm.rulesCopy);
        }

        vm.saveRules = () => {
            let sameData = angular.equals(vm.rulesCopy, vm.rules);
            if (!sameData && vm.editConfigurationRules.$valid) {
                let toastConfig = {message: 'Updating rules.'}
                Tournament.updateRules($scope.tournamentId, vm.rulesCopy)
                    .then(() => {
                        vm.resetRules();
                        toastConfig.message = 'Updated rules';
                        toastConfig.success = true;
                        vm.editingRules = false;
                    })
                    .catch(() => {
                        toastConfig.message = 'Could not update rules';
                        toastConfig.success = false;
                    })
                    .finally(() => {
                        toastConfig.hideAfter = true;
                        $scope.toast(toastConfig);
                    })
            } else if (sameData && vm.editConfigurationRules.$valid) {
                vm.editingRules = false;
            }
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
            vm.pointSchemeCopy.tossupValues = vm.pointSchemeCopy.tossupValues.filter(ps => ps !== point);
        }

        vm.saveDivision = (division) => {
            let newName = division.newName.trim();
            if (division.name.trim() !== newName && newName.length !== 0) {
                let toastConfig = {
                    message: 'Saving division.'
                }
                let oldName = division.name;
                $scope.toast(toastConfig);
                Division.editDivision($scope.tournamentId, division)
                    .then((newName) => {
                        toastConfig.success = true;
                        toastConfig.message = `Changed division: ${oldName} \u2192 ${newName}`;
                    })
                    .catch(error => {
                        toastConfig.success = false,
                        toastConfig.message = 'Could not update division.'
                    })
                    .finally(() => {
                        toastConfig.hideAfter = true;
                        $scope.toast(toastConfig);
                        division.editing = false;
                    })
            } else {
                division.editing = false;
            }
        }

        vm.addNewDivision = () => {
            let newDivisionName = vm.newDivision.name.trim();
            if (newDivisionName.length > 0 && vm.newDivision.phaseId) {
                let toastConfig = {
                    message: 'Adding division'
                }
                $scope.toast(toastConfig);
                Division.addDivision($scope.tournamentId, newDivisionName, vm.newDivision.phaseId)
                    .then((divisionName) => {
                        toastConfig.message = 'Added division: ' + divisionName;
                        toastConfig.success = true;
                        vm.newDivision = {name: ''};
                    })
                    .catch(error => {
                        toastConfig.message = 'Could not add division';
                        toastConfig.success = false;
                    })
                    .finally(() => {
                        toastConfig.hideAfter = true;
                        $scope.toast(toastConfig);
                    });
            }
        }

        vm.removeDivision = (division) => {
            let toastConfig = {
                message: 'Removing division.'
            }
            $scope.toast(toastConfig);
            Division.removeDivision($scope.tournamentId, division)
                .then(() => {
                    toastConfig.message = 'Removed division.'
                    toastConfig.success = true;
                })
                .catch(() => {
                    toastConfig.message = 'Could not remove division';
                    toastConfig.success = false;
                })
                .finally(() => {
                    toastConfig.hideAfter = true;
                    $scope.toast(toastConfig);
                });

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

        Division.getDivisions($scope.tournamentId);

    }
    
})();