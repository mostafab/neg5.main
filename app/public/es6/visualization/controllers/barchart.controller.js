(() => {

    angular.module('VizApp').controller('BarChartCtrl', ['$scope', '$timeout', 'Phase', 'Stats', 'ColorsFactory', 'StatsUtil', 'BarchartService', BarChartCtrl])
    
    function BarChartCtrl($scope, $timeout, Phase, Stats, ColorsFactory, StatsUtil, BarchartService) {
        
        const vm = this
        
        const {randomHexColor, generateDivisionColors} = ColorsFactory
        const defaultBarColor = '#5c6bc0'
        
        const tournamentId = 'ByRnhBS0'
        let addedPointValues = false

        vm.teamStats = []

        angular.copy(Stats.teamStats, vm.teamStats)

        vm.divisions = Stats.divisions
        vm.tournamentInfo = Stats.tournamentName
        vm.phases = Phase.phases
        
        vm.selectedPhase = null
        
        vm.divisionsColorMap = {}
        vm.yAxisStat = 'ppg'
        
        vm.statOptions = [
            'ppg',
            'ppb',
            'papg',
            'margin',
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
            margin: 'Average Margin of Victory',
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
            BarchartService.bindMouseOver()
            $scope.api.refresh()
        }
        
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
                color: d => vm.divisions.length === 0 ? defaultBarColor : (vm.divisionsColorMap[d.division_id] || 'black'),
                x: d => d.team_name,
                y: d => d[vm.yAxisStat],
                showValues: true,
                valueFormat: d => d,
                transitionDuration: 500,
                xAxis: {
                    axisLabel: 'Team',
                },
                yAxis: {
                    axisLabel: '',
                    axisLabelDistance: -15
                },
                staggerLabels: true
            }
        }
        
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
                    contentGenerator: (key, x, y, e, graph) => '<b>SDASd</b>'
                },
                transitionDuration: 500,
                dispatch: {

                },
                dimensions: [
                    'Wins',
                    'Losses',
                    'PPG',
                    'PAPG',
                    'Margin',
                    'TUH',
                    'PPB'
                ]
            }
        }

        vm.data = [
            {
                key: 'Teams',
                values: vm.teamStats
            }
        ]
               
        vm.getStats = () => {
             Stats.refreshStats(tournamentId, vm.selectedPhase ? vm.selectedPhase.id : null)
                .then(() => {
                    const copy = []
                    angular.copy(Stats.teamStats, copy)

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
                    
                    angular.copy(filtered, vm.teamStats)

                    vm.divisionsColorMap = generateDivisionColors(vm.divisions)

                    if (!addedPointValues) {
                        const vals = Stats.pointScheme.map(pv => pv.value)
                        vm.pcOptions.chart.dimensions.push(...vals)
                        vm.statOptions.push(...vals)
                        addedPointValues = true
                    }       
                    BarchartService.bindMouseOver()             
                })    
        }

        vm.getStats()     
        Phase.getPhases(tournamentId) 

    }
    
})()