'use strict';

(function () {
    angular.module('VizApp').factory('ColorsFactory', [ColorsFactory]);

    function ColorsFactory() {

        var randomHexColor = function randomHexColor() {
            return '#' + Math.floor(Math.random() * 16777215).toString(16);
        };

        var generateDivisionColors = function generateDivisionColors(divisions) {
            var seenColors = {};
            return divisions.reduce(function (map, current) {
                var color = randomHexColor();
                while (seenColors[color]) {
                    color = randomHexColor();
                }
                map[current.division_id] = color;
                return map;
            }, {});
        };

        return {
            randomHexColor: randomHexColor,
            generateDivisionColors: generateDivisionColors
        };
    }
})();