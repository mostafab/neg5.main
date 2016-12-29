/* global angular */
(() => {
  angular.module('statsApp')
    .directive('keepNameScroll', () => {
      const link = (scope, elem, attrs) => {
        const ngElem = angular.element(elem);
        ngElem.on('scroll', () => {
          const scrollLeftDist = ngElem.scrollLeft();
          if (scrollLeftDist > 30) {
            ngElem.attr('data-keep-name', '1');
          } else {
            ngElem.attr('data-keep-name', '0');
          }
        });
      };
      return {
        restrict: 'A',
        link,
      };
    });
})();
