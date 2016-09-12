'use strict';

(function () {

    angular.module('IndexApp', ['ngCookies', 'ngAnimate']).config(function ($animateProvider) {
        $animateProvider.classNameFilter(/angular-animate/);
    });

    angular.module('IndexApp').controller('IndexController', ['$cookies', '$scope', '$http', '$timeout', function ($cookies, $scope, $http, $timeout) {

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

        vm.toastMessage = null;

        vm.toast = function (_ref) {
            var message = _ref.message;
            var _ref$success = _ref.success;
            var success = _ref$success === undefined ? null : _ref$success;
            var _ref$hideAfter = _ref.hideAfter;
            var hideAfter = _ref$hideAfter === undefined ? false : _ref$hideAfter;

            if (hideAfter) {
                $timeout(function () {
                    vm.toastMessage = null;
                }, 2500);
            }
            vm.toastMessage = {
                message: message,
                success: success
            };
        };

        vm.login = function () {
            if ($scope.loginForm.$valid) {
                (function () {
                    var toastConfig = {
                        message: 'Attempting to log in'
                    };
                    vm.toast(toastConfig);
                    $http.post('/api/account/authenticate', vm.user).then(function (_ref2) {
                        var data = _ref2.data;

                        var token = data.token;
                        $cookies.put('nfToken', token);

                        toastConfig.success = true;
                        toastConfig.message = 'Taking you to home page.';

                        window.location = '/tournaments';
                    }).catch(function (error) {
                        toastConfig.success = false;
                        toastConfig.message = 'Invalid credentials.';
                        toastConfig.hideAfter = true;
                    }).finally(function () {
                        return vm.toast(toastConfig);
                    });
                })();
            }
        };

        vm.register = function () {
            if ($scope.registrationForm.$valid && vm.newUser.password === vm.newUser.passwordConfirm) {
                (function () {
                    var toastConfig = {
                        message: 'Attempting to register.'
                    };
                    vm.toast(toastConfig);
                    $http.post('/api/account', vm.newUser).then(function (_ref3) {
                        var data = _ref3.data;

                        vm.user = {
                            username: vm.newUser.username,
                            password: vm.newUser.password
                        };
                        toastConfig.message = 'Logging you in.';
                        toastConfig.success = true;

                        vm.login();
                    }).catch(function (error) {
                        toastConfig.message = 'Could not register. This username might be taken.';
                        toastConfig.success = false;

                        toastConfig.hideAfter = true;
                    }).finally(function () {
                        return vm.toast(toastConfig);
                    });
                })();
            }
        };
    }]);
})();