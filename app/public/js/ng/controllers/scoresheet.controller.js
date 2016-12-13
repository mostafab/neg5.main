'use strict';

(function () {

    angular.module('tournamentApp').controller('ScoresheetCtrl', ['$scope', 'Tournament', 'Team', 'Phase', 'Game', 'Cookies', ScoresheetCtrl]);

    function ScoresheetCtrl($scope, Tournament, Team, Phase, Game, Cookies) {

        var vm = this;

        vm.teams = Team.teams;
        vm.pointScheme = Tournament.pointScheme;
        vm.rules = Tournament.rules;
        vm.phases = Phase.phases;

        vm.game = newScoresheet();
        vm.newScoresheet = newScoresheet;

        function newScoresheet() {
            return {
                teams: [{
                    teamInfo: null,
                    players: [],
                    newPlayer: '',
                    overtime: 0
                }, {
                    teamInfo: null,
                    players: [],
                    newPlayer: '',
                    overtime: 0
                }],
                cycles: initializeCyclesArray(20),
                currentCycle: {
                    number: 1,
                    answers: [],
                    bonuses: []
                },
                onTossup: true,
                round: 0,
                packet: null,
                notes: null,
                moderator: null,
                phases: [],
                room: null
            };
        }

        vm.loadTeamPlayers = function (team) {
            var _team$teamInfo = team.teamInfo;
            var id = _team$teamInfo.id;
            var name = _team$teamInfo.name;


            var toastConfig = { message: 'Loading ' + name + ' players.' };
            $scope.toast(toastConfig);
            Team.getTeamById($scope.tournamentId, id).then(function (_ref) {
                var players = _ref.players;

                team.players = players;
                team.players.forEach(function (player, index) {
                    player.active = index < vm.rules.maxActive;
                    player.tuh = 0;
                });

                toastConfig.message = 'Loaded ' + name + ' players.';
                toastConfig.success = true;
            }).catch(function (error) {
                toastConfig.message = 'Could not load ' + name + ' players.';
                toastConfig.success = false;
            }).finally(function () {
                toastConfig.hideAfter = true;
                $scope.toast(toastConfig);
            });
        };

        vm.addPlayer = function (team) {
            if (team.newPlayer.length > 0) {
                (function () {
                    var toastConfig = {
                        message: 'Adding ' + team.newPlayer + ' to ' + team.teamInfo.name
                    };
                    $scope.toast(toastConfig);
                    Team.addPlayer($scope.tournamentId, team.teamInfo.id, team.newPlayer).then(function (player) {
                        team.players.push({
                            name: player.name,
                            id: player.id,
                            tuh: 0,
                            active: team.players.length + 1 <= vm.rules.maxActive
                        });
                        team.newPlayer = '';

                        toastConfig.message = 'Added ' + player.name + ' to ' + team.teamInfo.name;
                        toastConfig.success = true;
                    }).catch(function (error) {
                        toastConfig.message = 'Could not add ' + team.newPlayer + ' to ' + team.teamInfo.name;
                        toastConfig.success = false;
                    }).finally(function () {
                        toastConfig.hideAfter = true;
                        $scope.toast(toastConfig);
                    });
                })();
            }
        };

        vm.getNumberOfActivePlayers = function (players) {
            return players.filter(function (p) {
                return p.active;
            }).length;
        };

        vm.getTeamBouncebacks = function (teamId) {
            var sum = 0;
            vm.game.cycles.forEach(function (cycle) {
                if (!teamAnsweredTossupCorrectly(teamId, cycle) && cycleHasCorrectAnswer(cycle)) {
                    var numPartsBouncedBack = cycle.bonuses.filter(function (b) {
                        return b === teamId;
                    }).length;
                    sum += numPartsBouncedBack * vm.pointScheme.bonusPointValue;
                }
            });
            if (!teamAnsweredTossupCorrectly(teamId, vm.game.currentCycle) && cycleHasCorrectAnswer(vm.game.currentCycle)) {
                var numPartsBouncedBack = vm.game.currentCycle.bonuses.filter(function (b) {
                    return b === teamId;
                }).length;
                sum += numPartsBouncedBack * vm.pointScheme.bonusPointValue;
            }

            return sum;
        };

        vm.range = function (num) {
            return new Array(num);
        };

        vm.swapPlayers = function (players, initialIndex, toIndex) {
            // Swap works like this to get around angular dupes
            if (toIndex < 0) {
                toIndex = players.length - 1;
            } else if (toIndex === players.length) {
                toIndex = 0;
            }

            var tempArray = [];
            angular.copy(players, tempArray);

            var temp = players[initialIndex];
            tempArray[initialIndex] = tempArray[toIndex];
            tempArray[toIndex] = temp;

            angular.copy(tempArray, players);
        };

        vm.getNumberOfAnswersForPlayer = function (player) {
            return vm.game.cycles.reduce(function (total, current) {
                var playerAnsweredThisCycle = current.answers.some(function (a) {
                    return a.playerId === player.id;
                });
                return total + (playerAnsweredThisCycle ? 1 : 0);
            }, 0);
        };

        vm.setTeamThatGotBonusPartCurrentCycle = function (index, team, bonusesArray) {
            bonusesArray[index] = bonusesArray[index] === team.id ? null : team.id;
        };

        vm.getTeamThatGotTossup = function (cycle) {
            var index = cycle.answers.findIndex(function (a) {
                return a.type !== 'Neg';
            });
            return index === -1 ? null : cycle.answers[index].teamId;
        };

        vm.getTeamBonusPointsForCycle = function (teamId, cycleIndex) {
            var cycle = cycleIndex + 1 === vm.game.currentCycle.number ? vm.game.currentCycle : vm.game.cycles[cycleIndex];
            return cycle.bonuses.filter(function (b) {
                return b === teamId;
            }).length * vm.pointScheme.bonusPointValue;
        };

        vm.getTeamScoreUpToCycle = function (teamId, cycleIndex) {
            var score = 0;
            for (var i = 0; i <= cycleIndex; i++) {
                var cycle = vm.game.cycles[i];
                cycle.answers.forEach(function (a) {
                    if (a.teamId === teamId) {
                        score += a.value;
                    }
                });
                score += cycle.bonuses.filter(function (b) {
                    return b === teamId;
                }).length * vm.pointScheme.bonusPointValue;
            }
            if (cycleIndex + 1 === vm.game.currentCycle.number) {
                vm.game.currentCycle.answers.forEach(function (a) {
                    if (a.teamId === teamId) {
                        score += a.value;
                    }
                });
                score += vm.game.currentCycle.bonuses.filter(function (b) {
                    return b === teamId;
                }).length * vm.pointScheme.bonusPointValue;
            }

            return score;
        };

        vm.nextCycle = function () {
            var nextCycleNumber = vm.game.currentCycle.number + 1;
            var indexToAddCurrentCycleTo = vm.game.currentCycle.number - 1;
            if (indexToAddCurrentCycleTo >= vm.game.cycles.length - 1) {
                vm.game.cycles.push({
                    answers: [],
                    bonuses: []
                });
            }

            angular.copy(vm.game.currentCycle.answers, vm.game.cycles[indexToAddCurrentCycleTo].answers);
            angular.copy(vm.game.currentCycle.bonuses, vm.game.cycles[indexToAddCurrentCycleTo].bonuses);

            vm.game.currentCycle = {
                number: nextCycleNumber,
                answers: [],
                bonuses: []
            };

            incrementActivePlayersTUH(1);

            saveScoresheet();
        };

        vm.lastCycle = function () {
            if (vm.game.currentCycle.number > 1) {
                var indexToReset = vm.game.currentCycle.number - 1;
                vm.game.cycles[indexToReset] = {
                    answers: [],
                    bonuses: []
                };
                vm.game.cycles[indexToReset - 1].bonuses = [];
                vm.game.cycles[indexToReset - 1].answers = [];

                vm.game.currentCycle = {
                    answers: [],
                    bonuses: [],
                    number: vm.game.currentCycle.number - 1
                };
            }

            incrementActivePlayersTUH(-1);

            saveScoresheet();
        };

        vm.getPlayerAnswerForCycle = function (player, cycle) {
            return cycle.answers.find(function (a) {
                return a.playerId === player.id;
            });
        };

        vm.addPlayerAnswerToCurrentCycle = function (player, team, answer) {
            if (teamDidNotAnswerInCycle(team, vm.game.currentCycle)) {
                vm.game.currentCycle.answers.push({
                    playerId: player.id,
                    teamId: team.id,
                    value: answer.value,
                    type: answer.type
                });
            }
        };

        vm.getNumberOfTossupTypeForPlayer = function (player, tossupValue) {
            var cycleTotal = vm.game.cycles.reduce(function (total, cycle) {

                var numberInCycle = cycle.answers.filter(function (a) {
                    return a.playerId === player.id && a.value === tossupValue.value;
                }).length;

                return total + numberInCycle;
            }, 0);

            var numberInCurrentCycle = vm.game.currentCycle.answers.filter(function (a) {
                return a.playerId === player.id && a.type === tossupValue.type;
            }).length;

            return cycleTotal + numberInCurrentCycle;
        };

        vm.getPlayerTotalPoints = function (player) {
            var total = 0;
            vm.pointScheme.tossupValues.forEach(function (tv) {
                var numberForCurrentTV = vm.getNumberOfTossupTypeForPlayer(player, tv);

                total += numberForCurrentTV * tv.value;
            });
            return total;
        };

        vm.switchToBonusIfTossupGotten = function (answer, teamId) {
            if (answer.type !== 'Neg' && vm.teamDidNotNegInCycle(teamId, vm.game.currentCycle)) {
                vm.switchCurrentCycleContext(true);
            }
        };

        vm.removeLastAnswerFromCycle = function (cycle) {
            cycle.answers.pop();
            cycle.bonuses = [];
        };

        vm.getTeam = function (teamId) {
            if (teamId) {
                return vm.game.teams.find(function (team) {
                    return team.teamInfo.id === teamId;
                });
            }
        };

        vm.switchCurrentCycleContext = function (toBonus) {
            vm.game.onTossup = !toBonus;
        };

        vm.teamDidNotNegInCycle = function (teamId, cycle) {
            return cycle.answers.findIndex(function (answer) {
                return answer.type === 'Neg' && answer.teamId === teamId;
            }) === -1;
        };

        vm.removeTeamNegsFromCycle = function (teamId, cycle) {
            cycle.answers = cycle.answers.filter(function (a) {
                return !(a.type === 'Neg' && a.teamId === teamId);
            });
        };

        vm.loadLastSavedScoresheet = function () {
            var lastScoresheet = Cookies.localStorage.get('scoresheet_' + $scope.tournamentId);
            if (!lastScoresheet) {
                $scope.toast({
                    message: 'No prior saved scoresheet',
                    success: false,
                    hideAfter: true
                });
            } else {
                try {
                    vm.game = JSON.parse(lastScoresheet);
                    $scope.toast({
                        message: 'Loaded scoresheet.',
                        success: true,
                        hideAfter: true
                    });
                } catch (err) {
                    $scope.toast({
                        message: 'Could not read scoresheet.',
                        success: false,
                        hideAfter: true
                    });
                }
            }
        };

        vm.displayPlayerAnswerForCycle = function (player, cycleIndex) {
            var cycle = vm.game.cycles[cycleIndex];
            if (cycleIndex < vm.game.currentCycle.number - 1) {
                (function () {
                    if (!cycle.editing) {
                        cycle.editing = {};
                    }
                    if (!cycle.newAnswer) {
                        cycle.newAnswer = {};
                    }
                    var playerAnswer = vm.getPlayerAnswerForCycle(player, cycle);
                    if (!playerAnswer) {
                        cycle.newAnswer[player.id] = null;
                    } else {
                        cycle.newAnswer[player.id] = vm.pointScheme.tossupValues.find(function (tv) {
                            return tv.value === playerAnswer.value;
                        });
                    }

                    cycle.editing[player.id] = true;
                })();
            }
        };

        vm.displayCycleBonuses = function (teamId, cycleIndex) {
            var cycle = vm.game.cycles[cycleIndex];
            if (cycleIndex < vm.game.currentCycle.number - 1 && cycleHasCorrectAnswer(cycle)) {
                cycle.bonusesCopy = [];
                angular.copy(cycle.bonuses, cycle.bonusesCopy);

                cycle.editingBonus = true;
            }
        };

        vm.editPlayerAnswerForCycle = function (playerId, teamId, newTossupValue, cycle) {

            var filterFunction = void 0;

            if (newTossupValue && newTossupValue.type !== 'Neg') {
                filterFunction = function filterFunction(a) {
                    return a.teamId !== teamId && a.type === 'Neg';
                };
            } else {
                filterFunction = function filterFunction(a) {
                    return a.teamId !== teamId && a.type !== 'Neg';
                };
            }

            var filteredAnswers = cycle.answers.filter(filterFunction);

            if (newTossupValue) {
                filteredAnswers.push({
                    playerId: playerId,
                    teamId: teamId,
                    value: newTossupValue.value,
                    type: newTossupValue.type
                });
            }
            cycle.answers = filteredAnswers;

            if (!cycleHasCorrectAnswer(cycle)) {
                cycle.bonuses = [];
            }

            if (!cycle.editing) {
                cycle.editing = {};
            }
            cycle.editing[playerId] = false;
        };

        vm.editCycleBonuses = function (cycle) {
            if (cycle.bonusesCopy) {
                angular.copy(cycle.bonusesCopy, cycle.bonuses);
                cycle.editingBonus = false;
            }
        };

        vm.submitScoresheet = function () {
            if (!vm.scoresheetForm.$valid) {
                $scope.toast({
                    message: 'Please fix the errors on the scoresheet.',
                    success: false,
                    hideAfter: true
                });
            } else if (vm.game.submitted) {
                $scope.toast({
                    message: 'This match has already been submitted.',
                    success: false,
                    hideAfter: true
                });
            } else {
                (function () {
                    var parsedScoresheet = vm.parseScoresheet(vm.game);
                    var toastConfig = {
                        message: 'Adding match.'
                    };
                    $scope.toast(toastConfig);
                    Game.postGame($scope.tournamentId, parsedScoresheet).then(function (match) {
                        vm.game.id = match[0].id;
                        vm.game.submitted = true;

                        saveScoresheet();

                        toastConfig.success = true;
                        toastConfig.message = 'Added match';
                        Game.getGames($scope.tournamentId);
                    }).catch(function (error) {
                        toastConfig.success = false;
                        toastConfig.message = 'Failed to add match.';
                    }).finally(function () {
                        toastConfig.hideAfter = true;
                        $scope.toast(toastConfig);
                    });
                })();
            }
        };

        vm.parseScoresheet = function (scoresheet) {
            var game = {
                moderator: scoresheet.moderator,
                notes: scoresheet.notes,
                packet: scoresheet.packet,
                phases: scoresheet.phases,
                room: scoresheet.room,
                round: scoresheet.round,
                tuh: scoresheet.currentCycle.number - 1,
                teams: scoresheet.teams.map(function (team) {
                    return {
                        teamInfo: team.teamInfo,
                        players: team.players.filter(function (p) {
                            return p.tuh > 0;
                        }).map(function (player) {
                            return {
                                id: player.id,
                                tuh: player.tuh,
                                points: vm.pointScheme.tossupValues.reduce(function (aggr, tv) {
                                    aggr[tv.value] = vm.getNumberOfTossupTypeForPlayer(player, tv);
                                    return aggr;
                                }, {})
                            };
                        }),
                        score: vm.getTeamScoreUpToCycle(team.teamInfo.id, scoresheet.currentCycle.number - 1),
                        bouncebacks: vm.getTeamBouncebacks(team.teamInfo.id),
                        overtime: team.overtime || 0
                    };
                }),
                scoresheet: scoresheet.cycles.filter(function (c, index) {
                    return index < scoresheet.currentCycle.number - 1;
                }).map(function (c, index) {
                    return {
                        number: index + 1,
                        answers: c.answers,
                        bonuses: makeArray(vm.pointScheme.partsPerBonus).map(function (elem, index) {
                            return {
                                part: index + 1,
                                teamThatGotBonus: c.bonuses[index] || null
                            };
                        })
                    };
                })
            };

            return game;
        };

        vm.revertScoresheetSubmission = function () {
            var matchId = vm.game.id;
            if (matchId) {
                (function () {
                    var toastConfig = {
                        message: 'Reverting submission.'
                    };
                    $scope.toast(toastConfig);
                    Game.deleteGame($scope.tournamentId, matchId).then(function () {
                        vm.game.id = null;
                        vm.game.submitted = false;

                        toastConfig.message = 'Reverted submission';
                        toastConfig.success = true;
                    }).catch(function (error) {
                        toastConfig.message = 'Could not revert submission';
                        toastConfig.success = false;
                    }).finally(function () {
                        toastConfig.hideAfter = true;
                        $scope.toast(toastConfig);
                    });
                })();
            }
        };

        function makeArray(length) {
            var arr = [];
            for (var i = 0; i < length; i++) {
                arr[i] = undefined;
            }
            return arr;
        }

        function teamDidNotAnswerInCycle(team, cycle) {
            return cycle.answers.findIndex(function (answer) {
                return answer.teamId === team.id;
            }) === -1;
        }

        function cycleHasCorrectAnswer(cycle) {
            return cycle.answers.some(function (a) {
                return a.type !== 'Neg';
            });
        }

        function teamAnsweredTossupCorrectly(teamId, cycle) {
            return cycle.answers.some(function (a) {
                return a.teamId === teamId && a.type !== 'Neg';
            });
        }

        function incrementActivePlayersTUH(num) {
            vm.game.teams.forEach(function (team) {
                team.players.forEach(function (player) {
                    if (player.active && player.tuh + num >= 0) {
                        player.tuh += num;
                    }
                });
            });
        }

        function initializeCyclesArray(n) {
            var arr = [];
            for (var i = 0; i < n; i++) {
                arr.push({
                    answers: [],
                    bonuses: []
                });
            }
            return arr;
        }

        function saveScoresheet() {
            vm.game.lastSavedAt = new Date();
            Cookies.localStorage.set('scoresheet_' + $scope.tournamentId, JSON.stringify(vm.game));
        }
    }
})();