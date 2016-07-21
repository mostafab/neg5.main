'use strict';

(function () {

    angular.module('HomeApp', ['ngCookies']);

    angular.module('HomeApp').controller('HomeController', ['$cookies', '$scope', '$http', function ($cookies, $scope, $http) {

        var vm = this;

        vm.tournaments = [];

        vm.getTournaments = function () {
            var jwt = $cookies.get('nfToken');
            $http.get('/api/t?token=' + jwt).then(function (_ref) {
                var data = _ref.data;

                vm.tournaments = data;
            }).catch(function (error) {
                return console.log(error);
            });
        };

        vm.getTournaments();
    }]);
})();