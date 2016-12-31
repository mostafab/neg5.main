/* global window */
export default class IndexController {
  constructor($scope, $timeout, $cookies, AuthService) {
    this.$scope = $scope;
    this.$timeout = $timeout;
    this.$cookies = $cookies;
    this.AuthService = AuthService;

    this.loggingIn = true;
    this.user = {
      username: '',
      password: '',
    };
    this.newUser = {
      name: '',
      email: '',
      username: '',
      password: '',
      passwordConfirm: '',
    };
    this.toastMessage = null;
  }

  login() {
    const { $valid } = this.$scope.loginForm;
    if ($valid) {
      const toastConfig = {
        message: 'Attempting to log in',
      };
      this.toast(toastConfig);
      this.AuthService.authenticate(this.user)
        .then((token) => {
          this.$cookies.put('nfToken', token);
          toastConfig.success = true;
          toastConfig.message = 'Taking you to home page.';
          window.location = '/tournaments';
        })
        .catch(() => {
          toastConfig.success = false;
          toastConfig.message = 'Invalid credentials.';
          toastConfig.hideAfter = true;
        })
        .finally(() => this.toast(toastConfig));
    }
  }

  register() {
    const { $valid: validForm } = this.$scope.registrationForm;
    const formIsValid = validForm
      && this.newUser.password === this.newUser.passwordConfirm;
    if (formIsValid) {
      const toastConfig = {
        message: 'Attempting to register.',
      };
      this.toast(toastConfig);
      this.AuthService.register(this.newUser)
        .then(() => {
          this.user = {
            username: this.newUser.username,
            password: this.newUser.password,
          };
          toastConfig.message = 'Logging you in.';
          toastConfig.success = true;
          this.toast(toastConfig);
          this.$scope.loginForm.$valid = true;
          this.login();
        })
        .catch(() => {
          toastConfig.message = 'Could not register. This username or email might be taken.';
          toastConfig.success = false;
          toastConfig.hideAfter = true;
          this.toast(toastConfig);
        });
    }
  }

  toast({ message, success = null, hideAfter = false }) {
    if (hideAfter) {
      this.$timeout(() => {
        this.toastMessage = null;
      }, 2500);
    }
    this.toastMessage = {
      message,
      success,
    };
  }

}

IndexController.$inject = ['$scope', '$timeout', '$cookies', 'AuthService'];
