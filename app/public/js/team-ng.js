'use strict';

(function () {

    tournamentApp.controller('TeamController', ['$scope', '$http', function ($scope, $http) {

        $scope.teams = [];

        $scope.newTeam = {
            name: '',
            players: [{ name: '' }, { name: '' }, { name: '' }, { name: '' }]
        };

        $scope.getTournamentTeams = function () {
            var query = {
                method: 'GET',
                url: '/t/' + $scope.tournamentId + "/teams"
            };
            $http(query).then(function (_ref) {
                var data = _ref.data;
                var admin = data.admin;
                var teams = data.teams;

                $scope.admin = false;
                $scope.teams = teams;
            }, function (error) {});
        };

        $scope.addPlayer = function () {
            return $scope.newTeam.players.push({ name: '' });
        };

        $scope.addTeam = function () {
            console.log($scope.newTeam);
        };

        $scope.getTournamentTeams();
    }]);
})();