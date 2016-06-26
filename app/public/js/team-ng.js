'use strict';

(function () {

    angular.module('TournamentApp').controller('TeamController', ['$scope', '$http', function ($scope, $http) {

        var teamModel = this;

        teamModel.teams = [];

        teamModel.newTeam = {
            name: '',
            players: [{ name: '' }, { name: '' }, { name: '' }, { name: '' }]
        };

        teamModel.teamSortType = 'team_name';
        teamModel.teamSortReverse = true;
        teamModel.teamQuery = '';

        teamModel.testClick = function (index) {
            return console.log(index);
        };

        teamModel.getTournamentTeams = function () {
            var query = {
                method: 'GET',
                url: '/t/' + $scope.tournamentId + "/teams"
            };
            $http(query).then(function (_ref) {
                var data = _ref.data;
                var admin = data.admin;
                var teams = data.teams;

                teamModel.teams = teams;
            }).catch(function (error) {
                console.log(error);
            });
        };

        teamModel.addPlayer = function () {
            return teamModel.newTeam.players.push({ name: '' });
        };

        teamModel.addTeam = function () {
            console.log(teamModel.newTeam);
        };

        teamModel.getTournamentTeams();
    }]);
})();