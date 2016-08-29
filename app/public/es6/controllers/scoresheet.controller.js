(() => {

    angular.module('tournamentApp')
        .controller('ScoresheetCtrl', ['$scope', 'Tournament', 'Team', ScoresheetCtrl]);
        
    function ScoresheetCtrl($scope, Tournament, Team) {
        
        let vm = this;
        
        vm.teams = Team.teams;
        vm.pointScheme = Tournament.pointScheme;

        vm.game = {
            teams: [
                {
                    teamInfo: null,
                    players: []
                },
                {
                    teamInfo: null,
                    players: []
                }
            ],
            cycles: initializeCyclesArray(),
            currentCycle: {
                number: 1,
                answers: []
            },
            round: 0,
            packet: null,
            notes: null,
            room: null
        };

        vm.loadTeamPlayers = (team) => {
            let {id, name} = team.teamInfo;

            let toastConfig = {message: 'Loading ' + name + ' players.'};
            $scope.toast(toastConfig);
            Team.getTeamById($scope.tournamentId, id)
                .then(({players}) => {
                    team.players = players;

                    toastConfig.message = 'Loaded ' + name + ' players.';
                    toastConfig.success = true;
                })
                .catch(error => {
                    toastConfig.message = 'Could not load ' + name + ' players.';
                    toastConfig.success = false;
                })
                .finally(() => {
                    toastConfig.hideAfter = true;
                    $scope.toast(toastConfig);
                })
        }

        vm.getPlayerAnswerForCycle = (player, cycle) => {
            let currentCycleNumber = vm.game.currentCycle.number;
            if (cycle.number === currentCycleNumber) {
                return vm.game.currentCycle.answers.find(a => a.playerId === player.id);
            } else {
                return cycle.answers.find(a => a.playerId === player.id);
            }
        }

        vm.addPlayerAnswerToCurrentCycle = (player, answer) => {
            vm.game.currentCycle.answers.push({
                playerId: player.id,
                value: answer.value
            })
        }

        function initializeCyclesArray() {
            let arr = [];
            for (let i = 0; i < 20; i++) {
                arr.push({
                    answers: [],
                    number: i + 1
                })
            }
            return arr;
        }

    }
    
})();