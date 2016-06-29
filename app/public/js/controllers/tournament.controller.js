'use strict';

(function () {
    angular.module('tournamentApp').controller('TournamentCtrl', ['$scope', '$http', '$window', 'Team', 'Game', TournamentCtrl]);

    function TournamentCtrl($scope, $http, $window, Team, Game) {
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
        console.log(vm.teams);

        var getTournamentContext = function getTournamentContext() {
            $http.get('/api/t/' + $scope.tournamentId).then(function (_ref) {
                var data = _ref.data;

                $scope.tournamentInfo = {
                    name: data.name,
                    location: data.location,
                    questionSet: data.questionSet,
                    description: data.description,
                    hidden: data.hidden || true
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