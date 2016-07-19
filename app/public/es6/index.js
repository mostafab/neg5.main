'use strict';

(() => {

    angular.module('IndexApp', []);

    angular.module('IndexApp')
        .controller('IndexController', ['$scope', '$http', function($scope, $http) {

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
                // vm.loggingIn = true;
                if ($scope.loginForm.$valid) {
                    $http.post('/api/account/authenticate', vm.user)
                        .then(({data}) => {
                            console.log(data);
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