'use strict';

function levenshteinDistance(first, second) {
    if (first.length === 0) {
        return second.length;
    }
    if (second.length === 0) {
        return first.length;
    }
    var distanceMatrix = new Array(first.length + 1);
    for (var i = 0; i < distanceMatrix.length; i++) {
        distanceMatrix[i] = new Array(second.length + 1);
    }
    for (var _i = 0; _i < distanceMatrix[0].length; _i++) {
        distanceMatrix[0][_i] = _i;
    }
    for (var _i2 = 0; _i2 < distanceMatrix.length; _i2++) {
        distanceMatrix[_i2][0] = _i2;
    }
    for (var _i3 = 1; _i3 <= first.length; _i3++) {
        for (var j = 1; j <= second.length; j++) {
            if (first[_i3 - 1] === second[j - 1]) {
                distanceMatrix[_i3][j] = distanceMatrix[_i3 - 1][j - 1];
            } else {
                var min = Math.min(distanceMatrix[_i3][j - 1], distanceMatrix[_i3 - 1][j]);
                min = Math.min(min, distanceMatrix[_i3 - 1][j - 1]);
                distanceMatrix[_i3][j] = min + 1;
            }
        }
    }
    return distanceMatrix[first.length - 1][second.length - 1];
}

exports.levenshteinDistance = levenshteinDistance;