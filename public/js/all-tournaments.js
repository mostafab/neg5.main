'use strict';

(function($) {

    $(document).ready(function() {

        $(".tournament-anchor").click(function() {
            var href = $(this).attr("data-href");
            document.location = href;
        });

    });

    function checkSameValue(select1, select2) {
        return $(select1).val() == $(select2).val();
    }

    function mergeTournamentsAJAX(firstTournamentID, secondTournamentID, mergeName) {
        $("#merge-button").prop("disabled", true);
        $("#merge-button").text("Merging Tournaments...");
        $.ajax({
            url : "/tournaments/merge",
            type : "POST",
            data : {
                    first : firstTournamentID,
                    second : secondTournamentID,
                    name : mergeName
                },
            success : function(databack, status, xhr) {
                $("#merge-div").slideUp(300);
                $("#success-merge").attr("href",  "/t/" + databack.shortID);
                $("#success-merge-div").slideDown(300);
                addTournamentRow(databack);
            },
            error : function(xhr, status, err) {
                console.log(xhr);
                $("#merge-button").prop("disabled", false);
                if (xhr.status == 500) {
                    $("#merge-button").text("Unable to merge tournaments");
                } else if (xhr.status == 401) {
                    $("#merge-button").text("You're not logged in!");
                }

            }
        });
    }

})(jQuery);
