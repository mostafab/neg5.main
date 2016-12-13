'use strict';

(function () {
    angular.module('VizApp').controller('BaseCtrl', ['$scope', 'Stats', 'Phase', 'ColorsFactory', BaseCtrl]);

    function BaseCtrl($scope, Stats, Phase, Colors) {

        var vm = this;

        $scope.tournamentId = 'S1Au3xRzl';
        $scope.tournamentInfo = Stats.tournamentName;

        $scope.phases = Phase.phases;
        $scope.divisions = Stats.divisions;
        $scope.selectedPhase = null;

        $scope.divisionsColorMap = {};

        $scope.phasesWithColors = new Map();

        $scope.$watch(function () {
            return Stats.divisions;
        }, function () {
            // const mappedColors = $scope.phasesWithColors.get($scope.selectedPhase)
            // console.log($scope.selectedPhase)
            // if (mappedColors) {
            //     $scope.divisionsColorMap = mappedColors
            // } else {
            //     const newDivisionColors = Colors.generateKeyColors(Stats.divisions, 'division_id')
            //     $scope.phasesWithColors.set($scope.selectedPhase, newDivisionColors)
            //     $scope.divisionsColorMap = $scope.phasesWithColors.get($scope.selectedPhase)
            // }
            $scope.divisionsColorMap = Colors.generateKeyColors(Stats.divisions, 'division_id');
        }, true);

        $scope.getStats = function () {
            return Stats.refreshStats($scope.tournamentId, $scope.selectedPhase ? $scope.selectedPhase.id : null);
        };

        Phase.getPhases($scope.tournamentId);
        $scope.getStats();
    }
})();