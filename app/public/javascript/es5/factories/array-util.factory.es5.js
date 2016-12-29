'use strict';

/* global angular */
(function () {
  angular.module('tournamentApp').factory('ArrayUtil', [function ArrayUtil() {
    var arrayUnique = function arrayUnique(arr, func) {
      if (!arr || !func) {
        throw new Error('Invalid params: ' + arr + ', ' + func);
      }
      var set = new Set();
      var result = [];
      arr.forEach(function (elem, index) {
        var uniqueProp = func(elem, index);
        if (!set.has(uniqueProp)) {
          result.push(elem);
          set.add(uniqueProp);
        }
      });
      return result;
    };

    return {
      arrayUnique: arrayUnique
    };
  }]);
})();