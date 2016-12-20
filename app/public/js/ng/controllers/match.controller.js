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
            if (!team) return 0;
            var tossupSum = team.players.map(function (player) {
                return vm.pointSum(player.points);
            }).reduce(function (sum, current) {
                return sum + current;
            }, 0);
            return (team.score || 0) - tossupSum - (team.bouncebacks || 0);
        };

        vm.teamPPB = function (team) {
            if (!team) return 0;

            if (team.players.length === 0) return 0;

            var totalTossupsWithoutOT = totalTeamTossupGets(team) - (team.overtime || 0);
            var totalBonusPoints = vm.teamBonusPoints(team);
            return totalBonusPoints / totalTossupsWithoutOT || 0;
        };

        function totalTeamTossupGets(team) {
            if (!team) return 0;

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

        vm.currentGame = newGame();

        vm.loadedGame = {};
        vm.loadedGameOriginal = {};

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

        vm.resetForm = resetForm;

        vm.addGame = function () {
            if (vm.newGameForm.$valid) {
                (function () {
                    var toastConfig = { message: 'Adding match.' };
                    $scope.toast(toastConfig);
                    Game.postGame($scope.tournamentId, vm.currentGame).then(function () {
                        vm.resetForm();
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

        vm.loadGame = function (gameId) {
            var toastConfig = { message: 'Loading game.' };
            $scope.toast(toastConfig);
            Game.getGameById($scope.tournamentId, gameId).then(function (game) {
                game.phases = setLoadedGamePhases(game, vm.phases);
                setLoadedGameTeams(game, vm.teams);

                angular.copy(game, vm.loadedGame);
                angular.copy(vm.loadedGame, vm.loadedGameOriginal);

                toastConfig.message = 'Loaded game';
                toastConfig.success = true;
            }).catch(function (error) {
                toastConfig.message = 'Could not load game';
                toastConfig.success = false;
            }).finally(function () {
                toastConfig.hideAfter = true;
                $scope.toast(toastConfig);
            });
        };

        vm.resetLoadedGame = function () {
            return angular.copy(vm.loadedGameOriginal, vm.loadedGame);
        };

        vm.editLoadedGame = function () {
            if (vm.editGameForm.$valid) {
                (function () {
                    var toastConfig = { message: 'Editing match.' };
                    $scope.toast(toastConfig);
                    Game.editGame($scope.tournamentId, vm.loadedGame.id, vm.loadedGame).then(function () {
                        vm.loadedGame.editing = false;
                        vm.getGames();

                        toastConfig.message = 'Edited match.';
                        toastConfig.success = true;
                    }).catch(function (error) {
                        toastConfig.message = 'Could not edit match';
                        toastConfig.success = false;
                    }).finally(function () {
                        toastConfig.hideAfter = true;
                        $scope.toast(toastConfig);
                    });
                })();
            }
        };

        vm.deleteGame = function (gameId) {
            if (gameId) {
                (function () {
                    var toastConfig = { message: 'Deleting match.' };
                    $scope.toast(toastConfig);
                    Game.deleteGame($scope.tournamentId, gameId).then(function () {

                        vm.loadedGame = {};

                        toastConfig.message = 'Deleted match.';
                        toastConfig.success = true;
                    }).catch(function (error) {
                        toastConfig.message = 'Could not delete match.';
                        toastConfig.success = false;
                    }).finally(function () {
                        toastConfig.hideAfter = true;
                        $scope.toast(toastConfig);
                    });
                })();
            }
        };

        vm.resetCurrentGame = newGame;

        vm.numPlayerAnswers = function (player) {
            var onlyCorrectAnswers = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

            var sum = 0;
            for (var point in player.points) {
                if (player.points.hasOwnProperty(point) && (point >= 0 || !onlyCorrectAnswers)) {
                    sum += player.points[point] || 0;
                }
            }
            return sum;
        };

        vm.minPossibleTossupsHeard = function (match) {
            var totalCorrectAnswers = match.teams ? match.teams.reduce(function (sum, currentTeam) {
                var tossupsGotten = currentTeam.players.reduce(function (t, curr) {
                    return t + vm.numPlayerAnswers(curr, true);
                }, 0);
                return sum + tossupsGotten;
            }, 0) : 0;

            var totalWrongAnswers = match.teams ? match.teams.reduce(function (sum, currentTeam) {
                var totalNegs = currentTeam.players.reduce(function (t, curr) {
                    var total = 0;
                    for (var point in curr.points) {
                        if (curr.points.hasOwnProperty(point) && point < 0) {
                            total += curr.points[point];
                        }
                    }
                    return t + total;
                }, 0);
                return sum += totalNegs;
            }, 0) : 0;

            if (totalWrongAnswers > totalCorrectAnswers) {
                var extraNegs = totalWrongAnswers - totalCorrectAnswers;
                return extraNegs + totalCorrectAnswers;
            }
            return totalCorrectAnswers;
        };

        vm.matchSearch = function (match) {
            var normalizedQuery = vm.gameQuery.toLowerCase();
            var round = match.round;
            var teams = match.teams;

            var teamOneName = teams.one.name.toLowerCase();
            var teamTwoName = teams.two.name.toLowerCase();

            return match.round == normalizedQuery || teamOneName.indexOf(normalizedQuery) !== -1 || teamTwoName.indexOf(normalizedQuery) !== -1;
        };

        function newGame() {
            return {
                teams: [{
                    teamInfo: null,
                    players: [],
                    overtime: 0
                }, {
                    teamInfo: null,
                    players: [],
                    overtime: 0
                }],
                phases: [],
                round: 1,
                tuh: 20,
                room: null,
                moderator: null,
                packet: null,
                notes: null
            };
        }

        function resetForm() {
            vm.currentGame = vm.resetCurrentGame();
            vm.newGameForm.$setUntouched();
        }

        function setLoadedGamePhases(loadedGame, tournamentPhases) {
            var loadedGamePhaseMap = loadedGame.phases.reduce(function (aggr, current) {
                aggr[current.id] = true;
                return aggr;
            }, {});
            return tournamentPhases.filter(function (phase) {
                return loadedGamePhaseMap[phase.id] === true;
            });
        }

        function setLoadedGameTeams(loadedGame, teams) {
            loadedGame.teams.forEach(function (matchTeam) {
                var index = teams.findIndex(function (team) {
                    return team.id === matchTeam.id;
                });
                if (index !== -1) {
                    matchTeam.teamInfo = teams[index];
                }
            });
        }

        function buildTeamMap(teams) {
            return teams.reduce(function (aggr, current) {
                aggr[current.id] = current;
                return aggr;
            }, {});
        }

        vm.getGames();
    }
})();