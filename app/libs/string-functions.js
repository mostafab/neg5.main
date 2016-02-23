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
    for (var i = 0; i < distanceMatrix[0].length; i++) {
        distanceMatrix[0][i] = i;
    }
    for (var i = 0; i < distanceMatrix.length; i++) {
        distanceMatrix[i][0] = i;
    }
    for (var i = 1; i <= first.length; i++) {
        for (var j = 1; j <= second.length; j++) {
            if (first[i - 1] === second[j - 1]) {
                distanceMatrix[i][j] = distanceMatrix[i - 1][j - 1];
            } else {
                var min = Math.min(distanceMatrix[i][j - 1], distanceMatrix[i - 1][j]);
                var min = Math.min(min, distanceMatrix[i - 1][j - 1]);
                distanceMatrix[i][j] = min + 1;
            }
        }
    }
    return distanceMatrix[first.length - 1][second.length - 1];
}

exports.levenshteinDistance = levenshteinDistance;
