'use strict';

(function () {

    angular.module('tournamentApp').controller('StatisticsCtrl', ['$scope', 'Stats', StatisticsCtrl]);

    function StatisticsCtrl($scope, Stats) {

        var vm = this;

        vm.downloadQBJ = function () {
            Stats.getQBJReport($scope.tournamentId);
        };
    }
})();