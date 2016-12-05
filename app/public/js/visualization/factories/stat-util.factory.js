'use strict';

(function () {
    angular.module('VizApp').factory('StatsUtil', [StatsUtil]);

    function StatsUtil() {

        var buildTeamTossupCountMap = function buildTeamTossupCountMap(team) {
            return team.tossup_totals.reduce(function (aggr, tv) {
                aggr[tv.value] = tv.total;
                return aggr;
            }, {});
        };

        return {
            buildTeamTossupCountMap: buildTeamTossupCountMap
        };
    }
})();