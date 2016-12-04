(() => {

    angular.module('VizApp').controller('BarChartCtrl', ['$scope', '$timeout', 'Phase', 'Stats', 'ColorsFactory', BarChartCtrl])
    
    function BarChartCtrl($scope, $timeout, Phase, Stats, ColorsFactory) {
        
        const vm = this
        
        const {randomHexColor, generateDivisionColors} = ColorsFactory
        const defaultBarColor = '#5c6bc0'
        
        vm.teamStats = Stats.teamStats
        
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
            'raw_total_gets'
        ]
        
        vm.statsDisplayMap = {
            ppg: 'PPG',
            ppb: 'PPB',
            margin: 'Average Margin of Victory',
            papg: 'Average Points Scored by Opponent',
            total_negs: 'Total Negs',
            total_powers: 'Total Powers',
            raw_total_gets: 'Total Gets'
        }
        
        vm.refresh = () => $scope.api.refresh()
        
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
        
        vm.data = [
            {
                key: 'Values',
                values: vm.teamStats
            }
        ]
        
        vm.getStats = () => {
             Stats.refreshStats('ByRnhBS0', vm.selectedPhase ? vm.selectedPhase.id : null)
                .then(() => {
                    vm.divisionsColorMap = generateDivisionColors(vm.divisions)
                })    
        }
       
        vm.getStats()     
        Phase.getPhases('ByRnhBS0')
        
    }
    
})()