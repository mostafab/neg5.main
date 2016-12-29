/* global angular */
(() => {
  angular.module('tournamentApp')
    .factory('MathUtil', [function MathUtil() {
      const gcd = (a, b) => {
        if (b === 0) {
          return Math.abs(a);
        }
        return gcd(b, a % b);
      };

      const gcdArray = (arr) => {
        if (!arr || !Array.isArray(arr)) {
          throw new Error(`Invalid parameter: ${arr}`);
        }
        if (arr.length === 0) {
          throw new Error('Empty array given.');
        }
        let currentGcd = arr[0];
        for (let i = 0; i < arr.length - 1; i++) {
          currentGcd = gcd(currentGcd, arr[i + 1]);
        }
        return currentGcd;
      };

      return {
        gcd,
        gcdArray,
      };
    }]);
})();
