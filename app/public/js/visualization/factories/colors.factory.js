'use strict';

(function () {
    angular.module('VizApp').factory('ColorsFactory', [ColorsFactory]);

    function ColorsFactory() {

        var presetColors = ['#95ADB6', '#A599B5', '#A9F0D1', '#8C5E58', '#FF7E6B', '#5603AD', '#8367C7', '#B3E9C7', '#F4AC45', '#A61C3C', '#B3679B', '#6C4B5E', '#B191FF', '#B96D40', '#EC4E20', '#016FB9', '#FF9505', '#7FB7BE', '#93E1D8', '#55917F', '#44355B', '#EE5622', '#F433AB', '#FCB07E'];

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