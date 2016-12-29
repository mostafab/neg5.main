'use strict';

/* global angular */
(function () {
  angular.module('tournamentApp').factory('MathUtil', [function MathUtil() {
    var gcd = function gcd(a, b) {
      if (b === 0) {
        return Math.abs(a);
      }
      return gcd(b, a % b);
    };
    return {
      gcd: gcd
    };
  }]);
})();