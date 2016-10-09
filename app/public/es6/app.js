(() => {
    
  angular.module('tournamentApp', ['ngCookies', 'ngAnimate', 'statsApp'])
    .config($animateProvider => {
      $animateProvider.classNameFilter(/angular-animate/);
    })


})();






