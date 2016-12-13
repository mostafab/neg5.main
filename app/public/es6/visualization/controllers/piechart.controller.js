(() => {
    
    angular.module('VizApp').controller('PieChartCtrl', ['$scope', '$timeout', 'Phase', 'Stats', 'ColorsFactory', 'StatsUtil', PieChartCtrl])
    
    function PieChartCtrl($scope, $timeout, Phase, Stats, ColorsFactory, StatsUtil, BarchartService) {
        
        const vm = this
        
        const {randomHexColor, generateKeyColors} = ColorsFactory
        const defaultBarColor = '#5c6bc0'
        
        let addedPointValues = false
        
        $scope.$watch(() => Stats.teamStats, onReceiveNewTeamStats, true)
        
        vm.teamStats = []
        vm.yAxisStat = 'ppg'
        
        vm.statOptions = [
            'ppg',
            'ppb',
            'papg',
            'total_negs',
            'total_powers',
            'raw_total_gets',
            'raw_total_tossup_points',
            'total_points',
            'wins',
            'losses'
        ]
        
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
        }
        
        vm.refresh = () => {
            $scope.api.refresh()
        }
        
        vm.pieOptions = {
            chart: {
                type: 'pieChart',
                height: 1000,
                donut: true,
                x: d => d.team_name,
                y: d => d[vm.yAxisStat],
                showLabels: true,
                labelsOutside: true,
                color: d => $scope.divisions.length === 0 ? defaultBarColor : ($scope.divisionsColorMap[d.division_id] || 'black'),
                pie: {
                    startAngle: d => d.startAngle - Math.PI / 2,
                    endAngle: d => d.endAngle - Math.PI / 2
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
        }

        vm.data = [
            {
                key: 'Teams',
                values: vm.teamStats
            }
        ]
        
        function onReceiveNewTeamStats(newStats) {
            handleNewStats(newStats, vm.teamStats)
            if (!addedPointValues) {
                const vals = Stats.pointScheme.map(pv => pv.value)
                addedPointValues = true
            }             
        }

        function handleNewStats(src, dest) {
            const copy = []
            angular.copy(src, copy)

            const filtered = copy.filter(c => c.num_games > 0)
                .sort((first, second) => first.team_name.localeCompare(second.team_name))

            filtered.forEach(t => {
                t.tossup_totals.forEach(tv => t[tv.value] = tv.total)
                t.Wins = t.wins
                t.Losses = t.losses
                t.PPG = t.ppg
                t.PAPG = t.papg
                t.Margin = t.margin,
                t.TUH = t.total_tuh,
                t.PPB = t.ppb
            })
            
            angular.copy(filtered, dest)
        }


    }
    
})()