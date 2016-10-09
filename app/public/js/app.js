'use strict';

(function () {

  angular.module('tournamentApp', ['ngCookies', 'ngAnimate', 'statsApp']).config(function ($animateProvider) {
    $animateProvider.classNameFilter(/angular-animate/);
  });
})();