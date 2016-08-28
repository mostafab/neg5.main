'use strict';

(function () {

    angular.module('tournamentApp').controller('ScoresheetCtrl', ['$scope', 'Team', ScoresheetCtrl]);

    function ScoresheetCtrl($scope, Team) {

        var vm = this;

        vm.teams = Team.teams;
    }
})();