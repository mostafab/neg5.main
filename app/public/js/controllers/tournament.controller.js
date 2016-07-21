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

        vm.teams = Team.teams;
        vm.games = Game.games;

        var getTournamentContext = function getTournamentContext() {
            Tournament.getTournamentContext($scope.tournamentId).then(function (_ref) {
                var tournamentInfo = _ref.tournamentInfo;
                var tournamentContext = _ref.tournamentContext;

                $scope.tournamentInfo = tournamentInfo;
                $scope.tournamentContext = tournamentContext;
            });
            $http.get('/api/t/' + $scope.tournamentId).then(function (_ref2) {
                var data = _ref2.data;

                $scope.tournamentInfo = {
                    name: data.name,
                    location: data.location,
                    questionSet: data.questionSet,
                    description: data.description,
                    hidden: data.hidden || true,
                    pointScheme: data.pointScheme || []
                };
                $scope.tournamentContext.admin = true;
                $scope.tournamentContext.owner = true;
            }).catch(function (error) {
                console.log(error);
            });
        };

        getTournamentContext();
    }
})();