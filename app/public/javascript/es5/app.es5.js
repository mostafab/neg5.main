'use strict';

/* global angular */
(function () {
  angular.module('tournamentApp', ['ngCookies', 'ngAnimate']).config(function ($animateProvider) {
    $animateProvider.classNameFilter(/angular-animate/);
  });
})();