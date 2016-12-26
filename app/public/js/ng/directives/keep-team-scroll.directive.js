'use strict';

/* global angular */
(function () {
  angular.module('statsApp').directive('keepNameScroll', function () {
    var link = function link(scope, element, attrs) {
      console.log(element);
    };
    return {
      restrict: 'A',
      link: link
    };
  });
})();