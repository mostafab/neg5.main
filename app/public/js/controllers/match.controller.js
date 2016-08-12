'use strict';

(function () {

    angular.module('tournamentApp').filter('preventSameMatchTeams', function () {
        return function (items, otherTeamId) {
            return items.filter(function (item) {
                return item.id !== otherTeamId;
            });
        };
    });

    angular.module('tournamentApp').controller('GameCtrl', ['$scope', 'Team', 'Game', 'Phase', 'Tournament', GameCtrl]);

    function GameCtrl($scope, Team, Game, Phase, Tournament) {

        var vm = this;

        vm.teams = Team.teams;
        vm.games = Game.games;
        vm.phases = Phase.phases;

        vm.sortType = 'round';
        vm.sortReverse = false;
        vm.gameQuery = '';

        vm.pointScheme = Tournament.pointScheme;
        vm.rules = Tournament.rules;

        vm.pointSum = function (points) {
            if (!points) {
                return 0;
            }
            var values = Object.keys(points);
            return values.reduce(function (sum, current) {
                var product = points[current + ''] * current || 0;
                return sum + product;
            }, 0);
        };

        vm.teamBonusPoints = function (team) {
            var tossupSum = team.players.map(function (player) {
                return vm.pointSum(player.points);
            }).reduce(function (sum, current) {
                return sum + current;
            }, 0);
            return (team.score || 0) - tossupSum - (team.bouncebacks || 0);
        };

        vm.teamPPB = function (team) {
            if (team.players.length === 0) return 0;

            var totalTossupsWithoutOT = totalTeamTossupGets(team) - (team.overtime || 0);
            var totalBonusPoints = vm.teamBonusPoints(team);
            return totalBonusPoints / totalTossupsWithoutOT || 0;
        };

        function totalTeamTossupGets(team) {
            var totalTossups = team.players.map(function (player) {
                var sum = 0;
                for (var pv in player.points) {
                    if (player.points.hasOwnProperty(pv) && pv > 0) {
                        sum += player.points[pv];
                    }
                }
                return sum;
            }).reduce(function (sum, current) {
                return sum + current;
            }, 0);
            return totalTossups;
        }

        vm.currentGame = {
            teams: [{
                teamInfo: null,
                players: []
            }, {
                teamInfo: null,
                players: []
            }],
            phases: [],
            round: 1,
            tuh: 20,
            room: null,
            moderator: null,
            packet: null,
            notes: null
        };

        vm.addTeam = function (team) {
            var toastConfig = { message: 'Loading ' + team.teamInfo.name + ' players.' };
            $scope.toast(toastConfig);
            Game.getTeamPlayers($scope.tournamentId, team.teamInfo.id).then(function (players) {
                team.players = players.map(function (_ref) {
                    var name = _ref.name;
                    var id = _ref.id;

                    return {
                        id: id,
                        name: name,
                        points: vm.pointScheme.tossupValues.reduce(function (obj, current) {
                            obj[current.value] = 0;
                            return obj;
                        }, {}),
                        tuh: vm.currentGame.tuh
                    };
                });
                toastConfig.success = true;
                toastConfig.message = 'Loaded ' + team.teamInfo.name + ' players (' + team.players.length + ')';
            }).catch(function (error) {
                toastConfig.success = false;
                toastConfig.message = 'Could not load team.';
            }).finally(function () {
                toastConfig.hideAfter = true;
                $scope.toast(toastConfig);
            });
        };

        vm.getGames = function () {
            return Game.getGames($scope.tournamentId);
        };

        vm.addGame = function () {
            if (vm.newGameForm.$valid) {
                (function () {
                    var toastConfig = { message: 'Adding match.' };
                    $scope.toast(toastConfig);
                    Game.postGame($scope.tournamentId, vm.currentGame).then(function () {
                        vm.resetCurrentGame();
                        vm.getGames();
                        toastConfig.success = true;
                        toastConfig.message = 'Added match';
                    }).catch(function (error) {
                        toastConfig.success = false;
                        toastConfig.message = 'Could not add match';
                    }).finally(function () {
                        toastConfig.hideAfter = true;
                        $scope.toast(toastConfig);
                    });
                })();
            }
        };

        vm.resetCurrentGame = function () {
            vm.currentGame = {
                teams: [{
                    teamInfo: null,
                    players: []
                }, {
                    teamInfo: null,
                    players: []
                }],
                phases: [],
                round: 1,
                tuh: 20,
                room: null,
                moderator: null,
                packet: null,
                notes: null
            };
        };

        vm.getGames();
    }
})();