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

    var gcdArray = function gcdArray(arr) {
      if (!arr || !Array.isArray(arr)) {
        throw new Error('Invalid parameter: ' + arr);
      }
      if (arr.length === 0) {
        throw new Error('Empty array given.');
      }
      var currentGcd = Math.abs(arr[0]);
      for (var i = 0; i < arr.length - 1; i++) {
        currentGcd = gcd(currentGcd, arr[i + 1]);
      }
      return currentGcd;
    };

    return {
      gcd: gcd,
      gcdArray: gcdArray
    };
  }]);
})();