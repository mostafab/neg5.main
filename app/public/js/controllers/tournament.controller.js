'use strict';

(function () {
    angular.module('tournamentApp').controller('TournamentCtrl', ['$scope', '$http', '$window', 'Team', 'Game', 'Tournament', TournamentCtrl]);

    function TournamentCtrl($scope, $http, $window, Team, Game, Tournament) {

        $scope.tournamentId = $window.location.href.split('/')[4];

        $scope.tournamentContext = {
            admin: false,
            owner: false
        };
        $scope.tournamentInfo = {
            name: '',
            hidden: false
        };

        var vm = this;

        vm.tournamentInfoCopy = {};
        vm.teams = Team.teams;
        vm.games = Game.games;

        vm.editing = false;

        vm.resetOverview = function () {
            angular.copy($scope.tournamentInfo, vm.tournamentInfoCopy);
        };

        vm.editTournament = function () {
            Tournament.edit($scope.tournamentId, vm.tournamentInfoCopy).then(function (data) {
                copyToOriginalTournamentObject(data);
                vm.resetOverview();
                vm.editing = false;
            }).catch(function (error) {
                return console.log(error);
            });
        };

        var copyToOriginalTournamentObject = function copyToOriginalTournamentObject(data) {
            angular.copy(data, $scope.tournamentInfo);
        };

        var getTournamentContext = function getTournamentContext() {
            Tournament.getTournamentContext($scope.tournamentId).then(function (_ref) {
                var tournamentInfo = _ref.tournamentInfo;
                var tournamentContext = _ref.tournamentContext;

                $scope.tournamentInfo = tournamentInfo;
                angular.copy($scope.tournamentInfo, vm.tournamentInfoCopy);
                $scope.tournamentContext = tournamentContext;
            }).catch(function (error) {
                console.log(error);
            });
        };

        getTournamentContext();
    }
})();