(() => {
    angular.module('VizApp').factory('ColorsFactory', [ColorsFactory])
    
    function ColorsFactory() {
        
        const presetColors = [
            // '#95ADB6', '#A599B5', '#A9F0D1', '#8C5E58', '#FF7E6B', '#5603AD',
            // '#8367C7', '#B3E9C7', '#F4AC45', '#A61C3C', '#B3679B', '#6C4B5E',
            // '#B191FF', '#B96D40', '#EC4E20', '#016FB9', '#FF9505', '#7FB7BE',
            // '#93E1D8', '#55917F', '#44355B', '#EE5622', '#F433AB', '#FCB07E'
            '#e57373', '#d81b60', '#ab47bc', '#9575cd', '#311b92', '##7986cb',
            '#1a237e', '#42a5f5', '#4dd0e1', '#00838f', '#00897b', '#9e9d24',
            '#f57f17', '#bf360c', '#ffab91', '#a1887f', '#607d8b', '#1de9b6'         
        ]

        const randomHexColor = () => {
             return '#'+Math.floor(Math.random()*16777215).toString(16)
            // return presetColors[Math.floor(Math.random() * presetColors.length)]
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