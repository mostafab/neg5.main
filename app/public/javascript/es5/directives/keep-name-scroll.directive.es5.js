'use strict';

/* global angular */
(function () {
  angular.module('statsApp').directive('keepNameScroll', function () {
    var link = function link(scope, elem, attrs) {
      var ngElem = angular.element(elem);
      ngElem.on('scroll', function () {
        var scrollLeftDist = ngElem.scrollLeft();
        if (scrollLeftDist > 30) {
          ngElem.attr('data-keep-name', '1');
        } else {
          ngElem.attr('data-keep-name', '0');
        }
      });
    };
    return {
      restrict: 'A',
      link: link
    };
  });
})();