(() => {
    
    angular.module('tournamentApp')
        .controller('ConfigCtrl', ['$scope', 'Tournament', ConfigCtrl]);
    
    function ConfigCtrl($scope, Tournament) {
        
        let vm = this;

        vm.editingPointScheme = false;
        vm.pointScheme = Tournament.pointScheme;

        vm.pointSchemeCopy = [];

        angular.copy(vm.pointScheme, vm.pointSchemeCopy);

    }
    
})();