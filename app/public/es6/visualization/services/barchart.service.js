(() => {

    angular.module('VizApp').service('BarchartService', ['$timeout', Service])

    function Service($timeout) {

        const bindMouseOver = () => {
            $timeout(() => {
                const d = d3.selectAll('.discreteBar')
                d.on('mouseover', (s) => {
                    const {team_id} = s
                    const matchingPaths = d3.select('.nv-parallelCoordinates').selectAll('path').filter(x => {
                        if (!x.values) {
                            return false
                        }
                        const thisId = x.values.team_id
                        return thisId === team_id
                    })
                    matchingPaths.style('stroke-width', '20px')
                })
                .on('mouseout', (s) => {
                    const {team_id} = s
                    const matchingPaths = d3.select('.nv-parallelCoordinates').selectAll('path').filter(x => {
                        if (!x.values) {
                            return false
                        }
                        const thisId = x.values.team_id
                        return thisId === team_id
                    })
                    matchingPaths.style('stroke-width', '2px')
                })
            }, 100)
        }

        return {
            bindMouseOver
        }
        
    }

})()