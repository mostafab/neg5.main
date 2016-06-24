'use strict';

var tournamentApp = angular.module('TournamentApp', []);

tournamentApp.controller('TeamController', ['$scope', function ($scope, $http) {

    $scope.tournamentId = window.location.href.split('/')[4];

    $scope.teams = [{ team_name: 'Norcross' }];

    console.log($scope.tournamentId);
}]);