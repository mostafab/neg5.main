/* global angular */
(() => {
  angular.module('tournamentApp')
      .controller('ScoresheetCtrl', ['$scope', 'Tournament', 'Team', 'Phase', 'Game', 'Cookies', ScoresheetCtrl]);

  function ScoresheetCtrl($scope, Tournament, Team, Phase, Game, Cookies) {
    const vm = this;

    vm.teams = Team.teams;
    vm.pointScheme = Tournament.pointScheme;
    vm.rules = Tournament.rules;
    vm.phases = Phase.phases;
    vm.game = newScoresheet();
    vm.newScoresheet = newScoresheet;

    function newScoresheet() {
      return {
        teams: [
          {
            teamInfo: null,
            players: [],
            newPlayer: '',
            overtime: 0,
          },
          {
            teamInfo: null,
            players: [],
            newPlayer: '',
            overtime: 0,
          },
        ],
        cycles: initializeCyclesArray(20),
        currentCycle: {
          number: 1,
          answers: [],
          bonuses: [],
        },
        onTossup: true,
        round: 0,
        packet: null,
        notes: null,
        moderator: null,
        phases: [],
        room: null,
      };
    }

    vm.loadTeamPlayers = (team) => {
      const { id, name } = team.teamInfo;
      const toastConfig = { message: `Loading ${name} players.` };
      $scope.toast(toastConfig);
      Team.getTeamById($scope.tournamentId, id)
          .then(({ players }) => {
            team.players = players;
            team.players.forEach((player, index) => {
              player.active = index < vm.rules.maxActive;
              player.tuh = 0;
            });
            toastConfig.message = `Loaded ${name} players.`;
            toastConfig.success = true;
          })
          .catch(() => {
            toastConfig.message = `Could not load ${name} players.`;
            toastConfig.success = false;
          })
          .finally(() => {
            toastConfig.hideAfter = true;
            $scope.toast(toastConfig);
          });
    };

    vm.addPlayer = (team) => {
      if (team.newPlayer.length > 0) {
        const toastConfig = {
          message: `Adding ${team.newPlayer} to ${team.teamInfo.name}.`,
        };
        $scope.toast(toastConfig);
        Team.addPlayer($scope.tournamentId, team.teamInfo.id, team.newPlayer)
            .then((player) => {
              team.players.push({
                name: player.name,
                id: player.id,
                tuh: 0,
                active: team.players.length + 1 <= vm.rules.maxActive,
              });
              team.newPlayer = '';
              toastConfig.message = `Added ${player.name} to ${team.teamInfo.name}.`;
              toastConfig.success = true;
            })
            .catch(() => {
              toastConfig.message = `Could not add ${team.newPlayer} to ${team.teamInfo.name}`;
              toastConfig.success = false;
            })
            .finally(() => {
              toastConfig.hideAfter = true;
              $scope.toast(toastConfig);
            });
      }
    };

    vm.getNumberOfActivePlayers = players => players.filter(p => p.active).length;

    vm.getTeamBouncebacks = (teamId) => {
      let sum = 0;
      vm.game.cycles.forEach((cycle) => {
        if (!teamAnsweredTossupCorrectly(teamId, cycle) && cycleHasCorrectAnswer(cycle)) {
          const numPartsBouncedBack = cycle.bonuses.filter(b => b === teamId).length;
          sum += numPartsBouncedBack * vm.pointScheme.bonusPointValue;
        }
      });
      if (!teamAnsweredTossupCorrectly(teamId, vm.game.currentCycle)
        && cycleHasCorrectAnswer(vm.game.currentCycle)) {
        const numPartsBouncedBack = vm.game.currentCycle.bonuses.filter(b => b === teamId).length;
        sum += numPartsBouncedBack * vm.pointScheme.bonusPointValue;
      }
      return sum;
    };

    vm.range = num => new Array(num);

    vm.swapPlayers = (players, initialIndex, toIndex) => { // Swap works like this to get around angular dupes
      if (toIndex < 0) {
          toIndex = players.length - 1;
      } else if (toIndex === players.length) {
          toIndex = 0;
      }
      const tempArray = [];
      angular.copy(players, tempArray);

      const temp = players[initialIndex];
      tempArray[initialIndex] = tempArray[toIndex];
      tempArray[toIndex] = temp;

      angular.copy(tempArray, players);
    };

    vm.getNumberOfAnswersForPlayer = player => vm.game.cycles.reduce((total, current) => {
      const playerAnsweredThisCycle = current.answers.some(a => a.playerId === player.id);
      return total + (playerAnsweredThisCycle ? 1 : 0);
    }, 0);

    vm.setTeamThatGotBonusPartCurrentCycle = (index, team, bonusesArray) => {
      bonusesArray[index] = bonusesArray[index] === team.id ? null : team.id;
    };

    vm.getTeamThatGotTossup = (cycle) => {
      const index = cycle.answers.findIndex(a => a.type !== 'Neg');
      return index === -1 ? null : cycle.answers[index].teamId;
    };

    vm.getTeamBonusPointsForCycle = (teamId, cycleIndex) => {
      const cycle = cycleIndex + 1 === vm.game.currentCycle.number ? vm.game.currentCycle : vm.game.cycles[cycleIndex];
      return cycle.bonuses.filter(b => b === teamId).length * vm.pointScheme.bonusPointValue;
    };

    vm.getTeamScoreUpToCycle = (teamId, cycleIndex) => {
        let score = 0;
        for (let i = 0; i <= cycleIndex; i++) {
            let cycle = vm.game.cycles[i];
            cycle.answers.forEach(a => {
                if (a.teamId === teamId) {
                    score += a.value;
                }
            })
            score += cycle.bonuses.filter(b => b === teamId).length * vm.pointScheme.bonusPointValue;
        }
        if (cycleIndex + 1 === vm.game.currentCycle.number) {
            vm.game.currentCycle.answers.forEach(a => {
                if (a.teamId === teamId) {
                    score += a.value;
                }
            })
            score += vm.game.currentCycle.bonuses.filter(b => b === teamId).length * vm.pointScheme.bonusPointValue;
        }

        return score;
    }

    vm.nextCycle = () => {
        let nextCycleNumber = vm.game.currentCycle.number + 1;
        let indexToAddCurrentCycleTo = vm.game.currentCycle.number - 1;
        if (indexToAddCurrentCycleTo >= vm.game.cycles.length - 1) {
            vm.game.cycles.push({
                answers: [],
                bonuses: []
            })
        }

        angular.copy(vm.game.currentCycle.answers, vm.game.cycles[indexToAddCurrentCycleTo].answers)
        angular.copy(vm.game.currentCycle.bonuses, vm.game.cycles[indexToAddCurrentCycleTo].bonuses)

        vm.game.currentCycle = {
            number: nextCycleNumber,
            answers: [],
            bonuses: []
        }

        incrementActivePlayersTUH(1);

        saveScoresheet();

    }

    vm.lastCycle = () => {
        if (vm.game.currentCycle.number > 1) {
            let indexToReset = vm.game.currentCycle.number - 1;
            vm.game.cycles[indexToReset] = {
                answers: [],
                bonuses: []
            }
            vm.game.cycles[indexToReset - 1].bonuses = [];
            vm.game.cycles[indexToReset -1].answers = [];

            vm.game.currentCycle = {
                answers: [],
                bonuses: [],
                number: vm.game.currentCycle.number - 1
            }
        }

        incrementActivePlayersTUH(-1);

        saveScoresheet();
    }

    vm.getPlayerAnswerForCycle = (player, cycle) => {
        return cycle.answers.find(a => a.playerId === player.id);
    }

    vm.addPlayerAnswerToCurrentCycle = (player, team, answer) => {
        if (teamDidNotAnswerInCycle(team, vm.game.currentCycle)) {
            vm.game.currentCycle.answers.push({
                playerId: player.id,
                teamId: team.id,
                value: answer.value,
                type: answer.type
            })
        }
    }

    vm.getNumberOfTossupTypeForPlayer = (player, tossupValue) => {
        let cycleTotal = vm.game.cycles.reduce((total, cycle) => {

            let numberInCycle = cycle.answers.filter(a => a.playerId === player.id && a.value === tossupValue.value).length;

            return total + numberInCycle;

        }, 0);

        let numberInCurrentCycle = vm.game.currentCycle.answers.filter(a => a.playerId === player.id && a.type === tossupValue.type).length;

        return cycleTotal + numberInCurrentCycle;
    }

    vm.getPlayerTotalPoints = (player) => {
        let total = 0;
        vm.pointScheme.tossupValues.forEach(tv => {
            let numberForCurrentTV = vm.getNumberOfTossupTypeForPlayer(player, tv);

            total += (numberForCurrentTV * tv.value);
        })
        return total;

    }

    vm.switchToBonusIfTossupGotten = (answer, teamId) => {
        if (answer.type !== 'Neg' && vm.teamDidNotNegInCycle(teamId, vm.game.currentCycle)) {
            vm.switchCurrentCycleContext(true);
        }
    }

    vm.removeLastAnswerFromCycle = (cycle) => {
        cycle.answers.pop();
        cycle.bonuses = [];
    }

    vm.getTeam = (teamId) => {
        if (teamId) {
            return vm.game.teams.find(team => team.teamInfo.id === teamId)
        }
    }

    vm.switchCurrentCycleContext = (toBonus) => {
        vm.game.onTossup = !toBonus;
    }

    vm.teamDidNotNegInCycle = (teamId, cycle) => {
        return cycle.answers.findIndex(answer => answer.type === 'Neg' && answer.teamId === teamId) === -1;
    }

    vm.removeTeamNegsFromCycle = (teamId, cycle) => {
        cycle.answers = cycle.answers.filter(a => !(a.type === 'Neg' && a.teamId === teamId));
    }

    vm.loadLastSavedScoresheet = () => {
        let lastScoresheet = Cookies.localStorage.get('scoresheet_' + $scope.tournamentId);
        if (!lastScoresheet) {
            $scope.toast({
                message: 'No prior saved scoresheet',
                success: false,
                hideAfter: true
            })
        } else {
            try {
                vm.game = JSON.parse(lastScoresheet);
                $scope.toast({
                    message: 'Loaded scoresheet.',
                    success: true,
                    hideAfter: true
                })
            } catch (err) {
                $scope.toast({
                    message: 'Could not read scoresheet.',
                    success: false,
                    hideAfter: true
                })
            }
        }
    }

    vm.displayPlayerAnswerForCycle = (player, cycleIndex) => {
        const cycle = vm.game.cycles[cycleIndex];
        if (cycleIndex < vm.game.currentCycle.number - 1) {
            if (!cycle.editing) {
                cycle.editing = {};
            }
            if (!cycle.newAnswer) {
                cycle.newAnswer = {};
            }
            let playerAnswer = vm.getPlayerAnswerForCycle(player, cycle);
            if (!playerAnswer) {
                cycle.newAnswer[player.id] = null;
            } else {
                cycle.newAnswer[player.id] = vm.pointScheme.tossupValues.find(tv => tv.value === playerAnswer.value);
            }

            cycle.editing[player.id] = true;
        }
    }

    vm.displayCycleBonuses = (teamId, cycleIndex) => {
        const cycle = vm.game.cycles[cycleIndex];
        if (cycleIndex < vm.game.currentCycle.number - 1 && cycleHasCorrectAnswer(cycle)) {
            cycle.bonusesCopy = [];
            angular.copy(cycle.bonuses, cycle.bonusesCopy);

            cycle.editingBonus = true;
        }
    }

    vm.editPlayerAnswerForCycle = (playerId, teamId, newTossupValue, cycle) => {

        let filterFunction;

        if (newTossupValue && newTossupValue.type !== 'Neg') {
            filterFunction = (a) => a.teamId !== teamId && a.type === 'Neg';
        } else {
            filterFunction = (a) => a.teamId !== teamId && a.type !== 'Neg';
        }

        let filteredAnswers = cycle.answers.filter(filterFunction);

        if (newTossupValue) {
            filteredAnswers.push({
                playerId,
                teamId,
                value: newTossupValue.value,
                type: newTossupValue.type
            })
        }
        cycle.answers = filteredAnswers;

        if (!cycleHasCorrectAnswer(cycle)) {
            cycle.bonuses = [];
        }

        if (!cycle.editing) {
            cycle.editing = {};
        }
        cycle.editing[playerId] = false;
    }

    vm.editCycleBonuses = (cycle) => {
        if (cycle.bonusesCopy) {
            angular.copy(cycle.bonusesCopy, cycle.bonuses);
            cycle.editingBonus = false;
        }
    }

    vm.submitScoresheet = () => {
        if (!vm.scoresheetForm.$valid) {
            $scope.toast({
                message: 'Please fix the errors on the scoresheet.',
                success: false,
                hideAfter: true
            })
        } else if (vm.game.submitted) {
            $scope.toast({
                message: 'This match has already been submitted.',
                success: false,
                hideAfter: true
            })
        } else {
            let parsedScoresheet = vm.parseScoresheet(vm.game);
            let toastConfig = {
                message: 'Adding match.'
            }
            $scope.toast(toastConfig);
            Game.postGame($scope.tournamentId, parsedScoresheet)
                .then(match => {
                    vm.game.id = match[0].id;
                    vm.game.submitted = true;

                    saveScoresheet();

                    toastConfig.success = true;
                    toastConfig.message = 'Added match';
                    Game.getGames($scope.tournamentId);
                })
                .catch(error => {
                    toastConfig.success = false;
                    toastConfig.message = 'Failed to add match.'
                })
                .finally(() => {
                    toastConfig.hideAfter = true;
                    $scope.toast(toastConfig);
                })
        }
    }

    vm.parseScoresheet = (scoresheet) => {
        let game = {
            moderator: scoresheet.moderator,
            notes: scoresheet.notes,
            packet: scoresheet.packet,
            phases: scoresheet.phases,
            room: scoresheet.room,
            round: scoresheet.round,
            tuh: scoresheet.currentCycle.number - 1,
            teams: scoresheet.teams.map(team => {
                return {
                    teamInfo: team.teamInfo,
                    players: team.players.filter(p => p.tuh > 0).map(player => {
                        return {
                            id: player.id,
                            tuh: player.tuh,
                            points: vm.pointScheme.tossupValues.reduce((aggr, tv) => {
                                aggr[tv.value] = vm.getNumberOfTossupTypeForPlayer(player, tv);
                                return aggr;
                            }, {})
                        }
                    }),
                    score: vm.getTeamScoreUpToCycle(team.teamInfo.id, scoresheet.currentCycle.number - 1),
                    bouncebacks: vm.getTeamBouncebacks(team.teamInfo.id),
                    overtime: team.overtime || 0
                }
            }),
            scoresheet: scoresheet.cycles.filter((c, index) => index < scoresheet.currentCycle.number - 1).map((c, index) => {
                return {
                    number: index + 1,
                    answers: c.answers,
                    bonuses: makeArray(vm.pointScheme.partsPerBonus).map((elem, index) => {
                        return {
                            part: index + 1,
                            teamThatGotBonus: c.bonuses[index] || null
                        }
                    })
                }
            })
        }

        return game;
    }

    vm.revertScoresheetSubmission = () => {
        let matchId = vm.game.id;
        if (matchId) {
            let toastConfig = {
                message: 'Reverting submission.'
            }
            $scope.toast(toastConfig);
            Game.deleteGame($scope.tournamentId, matchId)
                .then(() => {
                    vm.game.id = null;
                    vm.game.submitted = false;

                    toastConfig.message = 'Reverted submission';
                    toastConfig.success = true;
                })
                .catch(error => {
                    toastConfig.message = 'Could not revert submission';
                    toastConfig.success = false;
                })
                .finally(() => {
                    toastConfig.hideAfter = true;
                    $scope.toast(toastConfig);
                })
        }
    }

    function makeArray(length) {
        let arr = [];
        for (let i = 0; i < length; i++) {
            arr[i] = undefined;
        }
        return arr;
    }

    function teamDidNotAnswerInCycle(team, cycle) {
        return cycle.answers.findIndex(answer => answer.teamId === team.id) === -1;
    }

    function cycleHasCorrectAnswer(cycle) {
        return cycle.answers.some(a => a.type !== 'Neg');
    }

    function teamAnsweredTossupCorrectly(teamId, cycle) {
        return cycle.answers.some(a => a.teamId === teamId && a.type !== 'Neg');
    }

    function incrementActivePlayersTUH(num) {
        vm.game.teams.forEach(team => {
            team.players.forEach(player => {
                if (player.active && player.tuh + num >= 0) {
                    player.tuh += num;
                }
            })
        })
    }

    function initializeCyclesArray(n) {
        let arr = [];
        for (let i = 0; i < n; i++) {
            arr.push({
                answers: [],
                bonuses: []
            })
        }
        return arr;
    }

    function saveScoresheet() {
        vm.game.lastSavedAt = new Date();
        Cookies.localStorage.set('scoresheet_' + $scope.tournamentId, JSON.stringify(vm.game));
    }

  }

})();