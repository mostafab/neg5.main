'use strict';

/* global angular */
(function () {
  angular.module('tournamentApp').factory('ArrayUtil', [function ArrayUtil() {
    var arrayUnique = function arrayUnique(arr) {
      var func = arguments.length <= 1 || arguments[1] === undefined ? function (elem, currentIndex, thisArray) {
        return elem;
      } : arguments[1];

      if (!arr || !func) {
        throw new Error('Invalid params: ' + arr + ', ' + func);
      }
      if (typeof func !== 'function') {
        throw new Error('Invalid func parameter: ' + func);
      }
      if (!Array.isArray(arr)) {
        throw new Error('Invalid arr parameter: ' + arr);
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

    var arrayMax = function arrayMax(arr) {
      var func = arguments.length <= 1 || arguments[1] === undefined ? function (elem, currentIndex, thisArray) {
        return elem;
      } : arguments[1];

      if (!arr || !func) {
        throw new Error('Invalid params: ' + arr + ', ' + func);
      }
      if (typeof func !== 'function') {
        throw new Error('Invalid func parameter: ' + func);
      }
      if (!Array.isArray(arr) || arr.length === 0) {
        throw new Error('Invalid arr parameter: ' + arr);
      }
      return arr.reduce(function (max, current, index, calledArray) {
        var next = func(current, index, calledArray);
        if (next > max) {
          return next;
        }
        return max;
      }, func(arr[0]));
    };

    return {
      arrayUnique: arrayUnique,
      arrayMax: arrayMax
    };
  }]);
})();