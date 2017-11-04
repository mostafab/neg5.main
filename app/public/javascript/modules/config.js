const $animateProvider = $animateProvider => {
  $animateProvider.classNameFilter(/angular-animate/);
};

$animateProvider.$inject = ['$animateProvider'];

export default $animateProvider;
