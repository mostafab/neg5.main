"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
var versionNumber = "1.2";

exports.default = {

    createQBJObject: function createQBJObject(tournamentId) {

        var qbjObj = {
            version: versionNumber,
            objects: []
        };

        return qbjObj;
    }

};