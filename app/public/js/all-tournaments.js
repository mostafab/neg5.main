'use strict';

// (function($) {

//     $(".tournament-anchor").click(function() {
//         var href = $(this).attr("data-href");
//         document.location = href;
//     });

// })(jQuery);

(function () {

    angular.module('HomeApp', ['ngCookies']);

    angular.module('HomeApp').controller('HomeController', ['$cookies', '$scope', function ($cookies, $scope) {

        console.log($cookies.get('nfToken'));
    }]);
})();