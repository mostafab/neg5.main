'use strict';

(function () {

    angular.module('tournamentApp').controller('CollabCtrl', ['$scope', '$timeout', 'Collaborator', CollabCtrl]);

    function CollabCtrl($scope, $timeout, Collaborator) {

        var vm = this;

        vm.searchQuery = '';
        vm.searchResults = [];

        vm.timeoutRequest = null;

        vm.collaborators = Collaborator.collaborators;

        vm.getCollaborators = function () {
            return Collaborator.getCollaborators($scope.tournamentId);
        };

        vm.getKeyPress = function (event) {
            if (vm.searchQuery.trim().length >= 2) {
                if (vm.timeoutRequest) {
                    $timeout.cancel(vm.timeoutRequest);
                }
                vm.timeoutRequest = $timeout(function () {
                    vm.findUsers();
                    vm.timeoutRequest = null;
                }, 333);
            }
        };

        vm.findUsers = function () {
            if (vm.searchQuery.trim().length > 0) {
                Collaborator.findUsers(vm.searchQuery).then(function (_ref) {
                    var users = _ref.users;
                    return vm.searchResults = users;
                }).catch(function (error) {
                    return console.log(error);
                });
            }
        };

        vm.addCollaborator = function (username) {
            var admin = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

            var toastConfig = {
                message: 'Adding ' + username
            };
            $scope.toast(toastConfig);
            Collaborator.postCollaborator($scope.tournamentId, username, admin).then(function () {
                removeFromSearchResults(username);
                toastConfig.message = 'Added ' + username;
                toastConfig.success = true;
            }).catch(function (error) {
                toastConfig.message = 'Could not add ' + username;
                toastConfig.success = false;
            }).finally(function () {
                toastConfig.hideAfter = true;
                $scope.toast(toastConfig);
            });
        };

        vm.toggleAdmin = function (collaborator) {
            Collaborator.updateCollaborator($scope.tournamentId, collaborator.username, !collaborator.admin).catch(function (error) {
                $scope.toast({
                    message: 'Could not change permissions',
                    success: false,
                    hideAfter: true
                });
            });
        };

        var removeFromSearchResults = function removeFromSearchResults(username) {
            var index = 0;
            while (vm.searchResults[index] && vm.searchResults[index].username !== username) {
                index++;
            }
            vm.searchResults.splice(index, 1);
        };

        vm.removeCollaborator = function (username) {
            return Collaborator.deleteCollaborator($scope.tournamentId, username);
        };

        vm.getCollaborators();
    }
})();