'use strict';

(function () {
  angular.module('tournamentApp').controller('StatisticsCtrl', ['$scope', 'QBJ', StatisticsCtrl]);

  function StatisticsCtrl($scope, QBJ) {
    var vm = this;

    vm.downloadQBJ = function () {
      var toastConfig = {
        message: 'Generating QBJ file.'
      };
      $scope.toast(toastConfig);
      QBJ.getQBJReport($scope.tournamentId, {
        download: true,
        fileName: $scope.tournamentInfo.name.toLowerCase().replace(/ /g, '_')
      }).then(function () {
        toastConfig.message = 'Generated QBJ file.';
        toastConfig.success = true;
      }).catch(function () {
        toastConfig.message = 'Could not download QBJ file.';
        toastConfig.success = false;
      }).finally(function () {
        toastConfig.hideAfter = true;
        $scope.toast(toastConfig);
      });
    };
  }
})();