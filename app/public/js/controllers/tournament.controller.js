'use strict';

(function () {
    angular.module('tournamentApp').controller('TournamentCtrl', ['$scope', '$http', '$window', '$timeout', 'Team', 'Game', 'Tournament', 'Cookies', TournamentCtrl]);

    function TournamentCtrl($scope, $http, $window, $timeout, Team, Game, Tournament, Cookies) {

        $scope.tournamentId = $window.location.pathname.split('/')[2];

        $scope.tournamentContext = {
            admin: false,
            owner: false
        };
        $scope.tournamentInfo = {
            name: '',
            hidden: false
        };
        $scope.toastMessage = null;

        var timeToastShows = 3000;

        $scope.toast = function (_ref) {
            var message = _ref.message;
            var _ref$success = _ref.success;
            var success = _ref$success === undefined ? null : _ref$success;
            var _ref$hideAfter = _ref.hideAfter;
            var hideAfter = _ref$hideAfter === undefined ? false : _ref$hideAfter;

            if (hideAfter) {
                $timeout(function () {
                    $scope.toastMessage = null;
                }, timeToastShows);
            }
            $scope.toastMessage = {
                message: message,
                success: success
            };
        };

        var vm = this;

        vm.tab = Cookies.get('nfTab') || 'overview';
        vm.matchTab = Cookies.get('nfMatchTab') || 'add';
        vm.teamTab = Cookies.get('nfTeamTab') || 'add';

        vm.tournamentInfoCopy = {};
        vm.teams = Team.teams;
        vm.games = Game.games;

        vm.editing = false;

        vm.resetOverview = function () {
            angular.copy($scope.tournamentInfo, vm.tournamentInfoCopy);
        };

        vm.editTournament = function () {
            if (vm.editTournamentForm.$valid) {
                (function () {
                    var toastConfig = {
                        message: 'Editing tournament'
                    };
                    $scope.toast(toastConfig);

                    Tournament.edit($scope.tournamentId, vm.tournamentInfoCopy).then(function (data) {
                        copyToOriginalTournamentObject(data);
                        vm.resetOverview();
                        vm.editing = false;
                        toastConfig.message = 'Edited tournament.';
                        toastConfig.success = true;
                    }).catch(function (error) {
                        toastConfig.message = 'Failed to update tournament.';
                        toastConfig.success = false;
                    }).finally(function () {
                        toastConfig.hideAfter = true;
                        $scope.toast(toastConfig);
                    });
                })();
            }
        };

        var copyToOriginalTournamentObject = function copyToOriginalTournamentObject(data) {
            angular.copy(data, $scope.tournamentInfo);
        };

        var getTournamentContext = function getTournamentContext() {
            Tournament.getTournamentContext($scope.tournamentId).then(function (_ref2) {
                var tournamentInfo = _ref2.tournamentInfo;
                var tournamentContext = _ref2.tournamentContext;

                $scope.tournamentInfo = tournamentInfo;
                $scope.tournamentContext = tournamentContext;

                angular.copy($scope.tournamentInfo, vm.tournamentInfoCopy);
            }).catch(function (error) {
                console.log(error);
            });
        };

        var setTabWatchers = function setTabWatchers() {
            $scope.$watch(angular.bind(vm, function () {
                return vm.tab;
            }), function (newVal) {
                Cookies.set('nfTab', newVal);
            });
            $scope.$watch(angular.bind(vm, function () {
                return vm.matchTab;
            }), function (newVal) {
                Cookies.set('nfMatchTab', newVal);
            });
            $scope.$watch(angular.bind(vm, function () {
                return vm.teamTab;
            }), function (newVal) {
                Cookies.set('nfTeamTab', newVal);
            });
        };

        setTabWatchers();
        getTournamentContext();
    }
})();