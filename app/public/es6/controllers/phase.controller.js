(() => {
    
    angular.module('tournamentApp')
        .controller('PhaseCtrl', ['$scope', 'Phase', PhaseCtrl]);
    
    function PhaseCtrl($scope, Phase) {
        
        let vm = this;
        
        vm.phases = Phase.phases;
        vm.newPhase = '';
        
        vm.getPhases = () => Phase.getPhases($scope.tournamentId);
        
        vm.addPhase = () => vm.phases.push({
            name: vm.newPhase,
            id: Math.random(),
            active: false
        });
        
        vm.removePhase = (id) => console.log(id);
        
        vm.editPhase = (phase) => {
            let formattedNewName = phase.newName.trim();
            let formattedOldName = phase.name.trim();
            if (formattedNewName !== formattedOldName && formattedNewName.length > 0) {
                let toastConfig = {
                    message: 'Editing phase.'
                }
                Phase.editPhase($scope.tournamentId, formattedNewName, phase.id)
                    .then((newName) => {
                        
                        phase.newName = newName;
                        phase.name = newName;
                        phase.editing = false;

                        toastConfig.message = 'Saved phase';
                        toastConfig.success = true;

                    })
                    .catch(() => {
                        toastConfig.message = 'Couldn\'t update phase';
                        toastConfig.success = false;
                    })
                    .finally(() => {
                        toastConfig.hideAfter = true;
                        $scope.toast(toastConfig);
                    })
            } else {
                phase.editing = false;
            }
        }
        
        vm.activePhase = vm.phases.find(phase => phase.active);
        
        vm.getPhases();
        
    }
    
})();