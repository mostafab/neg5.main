(() => {
    angular.module('VizApp').factory('StatsUtil', [StatsUtil])
    
    function StatsUtil() {
        
        const buildTeamTossupCountMap = (team) => team.tossup_totals.reduce((aggr, tv) => {
            aggr[tv.value] = tv.total
            return aggr
        }, {})
        
        return {
            buildTeamTossupCountMap
        }
        
    }
    
})()