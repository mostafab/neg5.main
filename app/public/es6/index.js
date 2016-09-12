'use strict';

(() => {

    angular.module('IndexApp', ['ngCookies', 'ngAnimate'])
        .config($animateProvider => {
            $animateProvider.classNameFilter(/angular-animate/);
        })

    angular.module('IndexApp')
        .controller('IndexController', ['$cookies', '$scope', '$http', '$timeout', function($cookies, $scope, $http, $timeout) {

            const vm = this;

            vm.loggingIn = false;

            vm.user = {
                username: '',
                password: ''
            }

            vm.newUser = {
                name: '',
                email: '',
                username: '',
                password: '',
                passwordConfirm: ''
            }
            
            vm.toastMessage = null;
            
            vm.toast = ({message, success = null, hideAfter = false}) => {
                if (hideAfter) {
                    $timeout(() => {
                        vm.toastMessage = null;
                    }, 2500);
                }
                vm.toastMessage = {
                    message,
                    success
                }                
            }

            vm.login = () => {
                if ($scope.loginForm.$valid) {
                    const toastConfig = {
                        message: 'Attempting to log in'
                    }
                    vm.toast(toastConfig);
                    $http.post('/api/account/authenticate', vm.user)
                        .then(({data}) => {
                            let token = data.token;
                            $cookies.put('nfToken', token);
                            
                            toastConfig.success = true;
                            toastConfig.message = 'Taking you to home page.'
                            
                            window.location = '/tournaments';
                        })
                        .catch(error => {                            
                            toastConfig.success = false;
                            toastConfig.message = 'Invalid credentials.';
                            toastConfig.hideAfter = true;
                        })
                        .finally(() => vm.toast(toastConfig));
                }
            }

            vm.register = () => {
                if ($scope.registrationForm.$valid &&
                    vm.newUser.password === vm.newUser.passwordConfirm) {
                        const toastConfig = {
                            message: 'Attempting to register.'
                        }
                        vm.toast(toastConfig);
                        $http.post('/api/account', vm.newUser)
                            .then(({data}) => {
                                vm.user = {
                                    username: vm.newUser.username,
                                    password: vm.newUser.password
                                }
                                toastConfig.message = 'Logging you in.';
                                toastConfig.success = true;
                                
                                vm.login();
                            })
                            .catch(error => {
                                toastConfig.message = 'Could not register. This username might be taken.';
                                toastConfig.success = false;
                                
                                toastConfig.hideAfter = true;
                            })
                            .finally(() => vm.toast(toastConfig));
                    
                }
            }

        }]);

})();