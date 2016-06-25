'use strict';

var tournamentApp = angular.module('TournamentApp', []).controller('TournamentController', ['$scope', '$http', function ($scope, $http) {

    $scope.tournamentId = window.location.href.split('/')[4];

    $scope.tournamentContext = {
        name: 'Hehehe'
    };

    var getTournamentContext = function getTournamentContext() {
        $http.get('/api/t/' + $scope.tournamentId).then(function (_ref) {
            var data = _ref.data;

            $scope.tournamentContext = {
                name: data.name
            };
        }, function (error) {});
    };

    getTournamentContext();
}]);