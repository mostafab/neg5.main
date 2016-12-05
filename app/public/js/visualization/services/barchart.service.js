'use strict';

(function () {

    angular.module('VizApp').service('BarchartService', ['$timeout', Service]);

    function Service($timeout) {

        var bindMouseOver = function bindMouseOver() {
            $timeout(function () {
                var d = d3.selectAll('.discreteBar');
                d.on('mouseover', function (s) {
                    var team_id = s.team_id;

                    var matchingPaths = d3.select('.nv-parallelCoordinates').selectAll('path').filter(function (x) {
                        if (!x.values) {
                            return false;
                        }
                        var thisId = x.values.team_id;
                        return thisId === team_id;
                    });
                    matchingPaths.style('stroke-width', '20px');
                }).on('mouseout', function (s) {
                    var team_id = s.team_id;

                    var matchingPaths = d3.select('.nv-parallelCoordinates').selectAll('path').filter(function (x) {
                        if (!x.values) {
                            return false;
                        }
                        var thisId = x.values.team_id;
                        return thisId === team_id;
                    });
                    matchingPaths.style('stroke-width', '2px');
                });
            }, 100);
        };

        return {
            bindMouseOver: bindMouseOver
        };
    }
})();