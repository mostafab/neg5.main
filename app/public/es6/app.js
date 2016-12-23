(() => {
  angular.module('tournamentApp', ['ngCookies', 'ngAnimate'])
    .config($animateProvider => {
      $animateProvider.classNameFilter(/angular-animate/);
    });
})();






