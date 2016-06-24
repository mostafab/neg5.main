'use strict';

(function () {

    var tournamentApp = angular.module('TournamentApp', []).controller('TeamController', ['$scope', '$http', function ($scope, $http) {

        $scope.tournamentId = window.location.href.split('/')[4];

        $scope.teams = [];
        $scope.admin = false;

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

        $scope.getTournamentTeams();
    }]);
})();