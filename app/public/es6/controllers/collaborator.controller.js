(() => {
    
    angular.module('tournamentApp')
        .controller('CollabCtrl', ['$scope', '$timeout', 'Collaborator', CollabCtrl]);
    
    function CollabCtrl($scope, $timeout, Collaborator) {
        
        let vm = this;
        
        vm.searchQuery = '';
        vm.searchResults = [];
        
        vm.timeoutRequest = null;

        vm.collaborators = Collaborator.collaborators;
        
        vm.getCollaborators = () => Collaborator.getCollaborators($scope.tournamentId);
        
        vm.getKeyPress = (event) => {
            if (vm.searchQuery.trim().length >= 2) {
                if (vm.timeoutRequest) {
                    $timeout.cancel(vm.timeoutRequest);
                }
                vm.timeoutRequest = $timeout(() => {
                    vm.findUsers();
                    vm.timeoutRequest= null;
                }, 333);
            }
        }
        
        vm.findUsers = () => {
            if (vm.searchQuery.trim().length > 0) {
               Collaborator.findUsers(vm.searchQuery)
                    .then(({users}) => vm.searchResults = users)
                    .catch(error => console.log(error)); 
            }            
        }
        
        vm.addCollaborator = (username, admin = false) => {
            let index = 0;
            while (vm.searchResults[index] && vm.searchResults[index].username !== username) {
                index++;
            }
            vm.searchResults.splice(index, 1);
        };
        
        vm.removeCollaborator = (username) => Collaborator.deleteCollaborator($scope.tournamentId, username);
        
        // vm.getCollaborators();
        
    }
    
})();