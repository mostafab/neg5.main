'use strict';

import mdiff from 'mdiff';

export const levenshteinDistance = (first, second) => {
    if (first.length === 0) {
        return second.length;
    }
    if (second.length === 0) {
        return first.length;
    }
    let distanceMatrix = new Array(first.length + 1);
    for (let i = 0; i < distanceMatrix.length; i++) {
        distanceMatrix[i] = new Array(second.length + 1);
    }
    for (let i = 0; i < distanceMatrix[0].length; i++) {
        distanceMatrix[0][i] = i;
    }
    for (let i = 0; i < distanceMatrix.length; i++) {
        distanceMatrix[i][0] = i;
    }
    for (let i = 1; i <= first.length; i++) {
        for (let j = 1; j <= second.length; j++) {
            if (first[i - 1] === second[j - 1]) {
                distanceMatrix[i][j] = distanceMatrix[i - 1][j - 1];
            } else {
                let min = Math.min(distanceMatrix[i][j - 1], distanceMatrix[i - 1][j]);
                min = Math.min(min, distanceMatrix[i - 1][j - 1]);
                distanceMatrix[i][j] = min + 1;
            }
        }
    }
    return distanceMatrix[first.length - 1][second.length - 1];
}

export const longestCommonSubsequence = (first, second) => mdiff(first, second).getLcs();
