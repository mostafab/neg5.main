'use strict';

(() => {

    angular.module('IndexApp', ['ngCookies']);

    angular.module('IndexApp')
        .controller('IndexController', ['$cookies', '$scope', '$http', function($cookies, $scope, $http) {

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

            vm.login = () => {
                if ($scope.loginForm.$valid) {
                    $http.post('/api/account/authenticate', vm.user)
                        .then(({data}) => {
                            console.log(data);
                            let token = data.token;
                            $cookies.put('nfToken', token);
                            window.location = '/tournaments';
                        })
                        .catch(error => console.log(error));
                }
            }

            vm.register = () => {
                if ($scope.registrationForm.$valid &&
                    vm.newUser.password === vm.newUser.passwordConfirm) {
                        $http.post('/api/account', vm.newUser)
                            .then(({data}) => {
                                console.log(data);
                            })
                            .catch(error => console.log(error));
                    
                }
            }

        }]);

})();