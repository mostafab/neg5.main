(() => {
    
    angular.module('tournamentApp')
        .controller('CollabCtrl', ['$scope', 'Collaborator', CollabCtrl]);
    
    function CollabCtrl($scope, Collaborator) {
        
        let vm = this;
        
        vm.searchQuery = '';
        vm.searchResults = [];
        
        vm.collaborators = Collaborator.collaborators;
        
        vm.getCollaborators = () => Collaborator.getCollaborators($scope.tournamentId);
        
        vm.getKeyPress = (event) => {
            if (event.which === 13) {
                vm.findUsers();
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
        
        vm.getCollaborators();
        
    }
    
})();