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
        
        vm.savePhases = () => {
            console.log(vm.phases);
        }
        
        vm.activePhase = vm.phases.find(phase => phase.active);
        
        // vm.getPhases();
        
    }
    
})();