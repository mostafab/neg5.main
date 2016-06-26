'use strict';

(function () {

    angular.module('tournamentApp').controller('StatisticsCtrl', ['$scope', 'Team', StatisticsCtrl]);

    function StatisticsCtrl($scope, Team) {

        var vm = this;

        vm.teams = Team.teams;
    }
})();