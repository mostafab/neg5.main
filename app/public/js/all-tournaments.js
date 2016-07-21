'use strict';

(function ($) {

    $(".tournament-anchor").click(function () {
        var href = $(this).attr("data-href");
        document.location = href;
    });
})(jQuery);