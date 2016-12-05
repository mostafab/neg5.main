'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

(function () {

    angular.module('VizApp').controller('BarChartCtrl', ['$scope', '$timeout', 'Phase', 'Stats', 'ColorsFactory', 'StatsUtil', 'BarchartService', BarChartCtrl]);

    function BarChartCtrl($scope, $timeout, Phase, Stats, ColorsFactory, StatsUtil, BarchartService) {

        var vm = this;

        var randomHexColor = ColorsFactory.randomHexColor;
        var generateDivisionColors = ColorsFactory.generateDivisionColors;

        var defaultBarColor = '#5c6bc0';

        var tournamentId = 'ByRnhBS0';
        var addedPointValues = false;

        vm.teamStats = [];

        angular.copy(Stats.teamStats, vm.teamStats);

        vm.divisions = Stats.divisions;
        vm.tournamentInfo = Stats.tournamentName;
        vm.phases = Phase.phases;

        vm.selectedPhase = null;

        vm.divisionsColorMap = {};
        vm.yAxisStat = 'ppg';

        vm.statOptions = ['ppg', 'ppb', 'papg', 'margin', 'total_negs', 'total_powers', 'raw_total_gets', 'raw_total_tossup_points', 'total_points', 'wins', 'losses'];

        vm.orderByDivisions = function () {
            return vm.teamStats.sort(function (first, second) {
                if (first.division_id === second.division_id) {
                    return first[vm.yAxisStat] - second[vm.yAxisStat];
                }
                return first.division_id.localeCompare(second.division_id);
            });
        };

        vm.orderByCurrentAxis = function () {
            return vm.teamStats.sort(function (first, second) {
                return first[vm.yAxisStat] - second[vm.yAxisStat];
            });
        };

        vm.statsDisplayMap = {
            ppg: 'PPG',
            ppb: 'PPB',
            margin: 'Average Margin of Victory',
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
            BarchartService.bindMouseOver();
            $scope.api.refresh();
        };

        vm.options = {
            chart: {
                type: 'discreteBarChart',
                height: 600,
                margin: {
                    top: 20,
                    right: 0,
                    bottom: 60,
                    left: 55
                },
                color: function color(d) {
                    return vm.divisions.length === 0 ? defaultBarColor : vm.divisionsColorMap[d.division_id] || 'black';
                },
                x: function x(d) {
                    return d.team_name;
                },
                y: function y(d) {
                    return d[vm.yAxisStat];
                },
                showValues: true,
                valueFormat: function valueFormat(d) {
                    return d;
                },
                transitionDuration: 500,
                xAxis: {
                    axisLabel: 'Team'
                },
                yAxis: {
                    axisLabel: '',
                    axisLabelDistance: -15
                },
                staggerLabels: true
            }
        };

        vm.pcOptions = {
            chart: {
                type: 'parallelCoordinates',
                height: 600,
                margin: {
                    top: 30,
                    right: 10,
                    bottom: 10,
                    left: 10
                },
                tooltip: {
                    contentGenerator: function contentGenerator(key, x, y, e, graph) {
                        return '<b>SDASd</b>';
                    }
                },
                transitionDuration: 500,
                dispatch: {},
                dimensions: ['Wins', 'Losses', 'PPG', 'PAPG', 'Margin', 'TUH', 'PPB']
            }
        };

        vm.data = [{
            key: 'Teams',
            values: vm.teamStats
        }];

        vm.getStats = function () {
            Stats.refreshStats(tournamentId, vm.selectedPhase ? vm.selectedPhase.id : null).then(function () {
                handleNewStats(Stats.teamStats, vm.teamStats);
                vm.divisionsColorMap = generateDivisionColors(vm.divisions);
                if (!addedPointValues) {
                    var _vm$pcOptions$chart$d, _vm$statOptions;

                    var vals = Stats.pointScheme.map(function (pv) {
                        return pv.value;
                    });
                    (_vm$pcOptions$chart$d = vm.pcOptions.chart.dimensions).push.apply(_vm$pcOptions$chart$d, _toConsumableArray(vals));
                    (_vm$statOptions = vm.statOptions).push.apply(_vm$statOptions, _toConsumableArray(vals));
                    addedPointValues = true;
                }
                BarchartService.bindMouseOver();
            });
        };

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

        vm.getStats();
        Phase.getPhases(tournamentId);
    }
})();