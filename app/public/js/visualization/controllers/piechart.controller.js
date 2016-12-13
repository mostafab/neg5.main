'use strict';

(function () {

    angular.module('VizApp').controller('PieChartCtrl', ['$scope', '$timeout', 'Phase', 'Stats', 'ColorsFactory', 'StatsUtil', PieChartCtrl]);

    function PieChartCtrl($scope, $timeout, Phase, Stats, ColorsFactory, StatsUtil, BarchartService) {

        var vm = this;

        var randomHexColor = ColorsFactory.randomHexColor;
        var generateKeyColors = ColorsFactory.generateKeyColors;

        var defaultBarColor = '#5c6bc0';

        var addedPointValues = false;

        $scope.$watch(function () {
            return Stats.teamStats;
        }, onReceiveNewTeamStats, true);

        vm.teamStats = [];
        vm.yAxisStat = 'ppg';

        vm.statOptions = ['ppg', 'ppb', 'papg', 'total_negs', 'total_powers', 'raw_total_gets', 'raw_total_tossup_points', 'total_points', 'wins', 'losses'];

        vm.statsDisplayMap = {
            ppg: 'PPG',
            ppb: 'PPB',
            papg: 'Average Points Scored by Opponent',
            total_negs: 'Total Negs',
            total_powers: 'Total Powers',
            raw_total_gets: 'Total Gets',
            raw_total_tossup_points: 'Total Tossup Points',
            total_points: 'Total Points',
            wins: 'Wins',
            losses: 'Losses'
        };

        vm.refresh = function () {
            $scope.api.refresh();
        };

        vm.pieOptions = {
            chart: {
                type: 'pieChart',
                height: 1000,
                donut: true,
                x: function x(d) {
                    return d.team_name;
                },
                y: function y(d) {
                    return d[vm.yAxisStat];
                },
                showLabels: true,
                labelsOutside: true,
                color: function color(d) {
                    return $scope.divisions.length === 0 ? defaultBarColor : $scope.divisionsColorMap[d.division_id] || 'black';
                },
                pie: {
                    startAngle: function startAngle(d) {
                        return d.startAngle - Math.PI / 2;
                    },
                    endAngle: function endAngle(d) {
                        return d.endAngle - Math.PI / 2;
                    }
                },
                showLegend: false,
                duration: 500,
                legend: {
                    margin: {
                        top: 5,
                        right: 70,
                        bottom: 5,
                        left: 50
                    }
                }
            }
        };

        vm.data = [{
            key: 'Teams',
            values: vm.teamStats
        }];

        function onReceiveNewTeamStats(newStats) {
            handleNewStats(newStats, vm.teamStats);
            if (!addedPointValues) {
                var vals = Stats.pointScheme.map(function (pv) {
                    return pv.value;
                });
                addedPointValues = true;
            }
        }

        function handleNewStats(src, dest) {
            var copy = [];
            angular.copy(src, copy);

            var filtered = copy.filter(function (c) {
                return c.num_games > 0;
            }).sort(function (first, second) {
                return first.team_name.localeCompare(second.team_name);
            });

            filtered.forEach(function (t) {
                t.tossup_totals.forEach(function (tv) {
                    return t[tv.value] = tv.total;
                });
                t.Wins = t.wins;
                t.Losses = t.losses;
                t.PPG = t.ppg;
                t.PAPG = t.papg;
                t.Margin = t.margin, t.TUH = t.total_tuh, t.PPB = t.ppb;
            });

            angular.copy(filtered, dest);
        }
    }
})();