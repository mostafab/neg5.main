'use strict';

(function () {

    angular.module('tournamentApp').controller('StatisticsCtrl', ['$scope', 'Stats', StatisticsCtrl]);

    function StatisticsCtrl($scope, Stats) {

        var vm = this;

        vm.downloadQBJ = function () {
            var toastConfig = {
                message: 'Generating QBJ file.'
            };
            $scope.toast(toastConfig);
            Stats.getQBJReport($scope.tournamentId, {
                download: true,
                fileName: $scope.tournamentInfo.name.toLowerCase().replace(/ /g, '_')
            }).then(function () {
                toastConfig.message = 'Generated QBJ file.';
                toastConfig.success = true;
            }).catch(function (error) {
                toastConfig.message = 'Could not download QBJ file.';
                toastConfig.success = false;
            }).finally(function () {
                toastConfig.hideAfter = true;
                $scope.toast(toastConfig);
            });
        };
    }
})();