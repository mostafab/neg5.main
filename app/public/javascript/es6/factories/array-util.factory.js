/* global angular */
(() => {
  angular.module('tournamentApp')
    .factory('ArrayUtil', [function ArrayUtil() {
      const arrayUnique = (arr, func = (elem, currentIndex, thisArray) => elem) => {
        if (!arr || !func) {
          throw new Error(`Invalid params: ${arr}, ${func}`);
        }
        if (typeof (func) !== 'function') {
          throw new Error(`Invalid func parameter: ${func}`);
        }
        if (!Array.isArray(arr)) {
          throw new Error(`Invalid arr parameter: ${arr}`);
        }
        const set = new Set();
        const result = [];
        arr.forEach((elem, index) => {
          const uniqueProp = func(elem, index);
          if (!set.has(uniqueProp)) {
            result.push(elem);
            set.add(uniqueProp);
          }
        });
        return result;
      };

      const arrayMax = (arr, func = (elem, currentIndex, thisArray) => elem) => {
        if (!arr || !func) {
          throw new Error(`Invalid params: ${arr}, ${func}`);
        }
        if (typeof (func) !== 'function') {
          throw new Error(`Invalid func parameter: ${func}`);
        }
        if (!Array.isArray(arr) || arr.length === 0) {
          throw new Error(`Invalid arr parameter: ${arr}`);
        }
        return arr.reduce((max, current, index, calledArray) => {
          const next = func(current, index, calledArray);
          if (next > max) {
            return next;
          }
          return max;
        }, func(arr[0]));
      };

      return {
        arrayUnique,
        arrayMax,
      };
    }]);
})();
