'use strict';

(function () {

    angular.module('IndexApp', ['ngCookies']);

    angular.module('IndexApp').controller('IndexController', ['$cookies', '$scope', '$http', function ($cookies, $scope, $http) {

        var vm = this;

        vm.loggingIn = false;

        vm.user = {
            username: '',
            password: ''
        };

        vm.newUser = {
            name: '',
            email: '',
            username: '',
            password: '',
            passwordConfirm: ''
        };

        vm.login = function () {
            if ($scope.loginForm.$valid) {
                $http.post('/api/account/authenticate', vm.user).then(function (_ref) {
                    var data = _ref.data;

                    console.log(data);
                    var token = data.token;
                    $cookies.put('nfToken', token);
                    window.location = '/tournaments';
                }).catch(function (error) {
                    return console.log(error);
                });
            }
        };

        vm.register = function () {
            if ($scope.registrationForm.$valid && vm.newUser.password === vm.newUser.passwordConfirm) {
                $http.post('/api/account', vm.newUser).then(function (_ref2) {
                    var data = _ref2.data;

                    console.log(data);
                }).catch(function (error) {
                    return console.log(error);
                });
            }
        };
    }]);
})();