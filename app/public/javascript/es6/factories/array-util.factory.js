/* global angular */
(() => {
  angular.module('tournamentApp')
        .factory('ArrayUtil', [function ArrayUtil() {
          const arrayUnique = (arr, func) => {
            if (!arr || !func) {
              throw new Error(`Invalid params: ${arr}, ${func}`);
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

          return {
            arrayUnique,
          };
        }]);
})();
