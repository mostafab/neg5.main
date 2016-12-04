(() => {
    angular.module('VizApp').factory('ColorsFactory', [ColorsFactory])
    
    function ColorsFactory() {
        
        const randomHexColor = () => {
             return '#'+Math.floor(Math.random()*16777215).toString(16)
        }
        
        const generateDivisionColors = divisions => {
            const seenColors = {}
            return divisions.reduce((map, current) => {
                let color = randomHexColor()
                while (seenColors[color]) {
                    color = randomHexColor()
                }
                map[current.division_id] = color
                return map
            }, {})
        }
        
        return {
            randomHexColor,
            generateDivisionColors
        }
        
    }
    
})()