(() => {
  angular.module('tournamentApp')
      .controller('StatisticsCtrl', ['$scope', 'QBJ', StatisticsCtrl]);

  function StatisticsCtrl($scope, QBJ) {
    const vm = this;
    
    vm.downloadQBJ = () => {
      const toastConfig = {
        message: 'Generating QBJ file.'
      };
      $scope.toast(toastConfig);
      QBJ.getQBJReport($scope.tournamentId, {
        download: true, 
        fileName: $scope.tournamentInfo.name.toLowerCase().replace(/ /g, '_'),
      })
      .then(() => {
        toastConfig.message = 'Generated QBJ file.';
        toastConfig.success = true;
      })
      .catch(() => {
        toastConfig.message = 'Could not download QBJ file.';
        toastConfig.success = false;
      })
      .finally(() => {
        toastConfig.hideAfter = true;
        $scope.toast(toastConfig);
      });
    };
  }
})();
