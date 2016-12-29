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
      return {
        gcd,
      };
    }]);
})();
