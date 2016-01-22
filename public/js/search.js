$(document).ready(function() {

    function getTournaments() {
        $.ajax({
            url: "/search/submit",
            type: "GET",
            data: $("#search-tournaments").serialize(),
            success : function(databack, status, xhr) {
                $("#results-body").empty();
                $(databack).hide().appendTo("#results-body").fadeIn(300);
                // $("#results-body").empty().append(databack);
                $("#search-submit").text("Search");
            },
            error : function(xhr, status, err) {
                $("#search-submit").text("Something went wrong!");
            },
            complete : function(xhr, status) {
                $("#search-submit").prop("disabled", false);
            }
        });
    }

    $("#search-submit").click(function() {
        var empty = 0;
        $("#search-tournaments").find("input").each(function() {
            if ($(this).val().trim().length === 0) {
                empty++;
            }
        });
        if (empty !== 2) {
            $(this).text("Searching..").prop("disabled", true);
            getTournaments();
        }
    });
});
