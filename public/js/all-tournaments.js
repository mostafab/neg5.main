'use strict';

$(document).ready(function() {

    $("#merge-button").click(function() {
        $(this).text("Merge Tournaments");
        $("#name-merge").css("border-color", "white");
        var selected = true;
        $(".tournament-select").each(function(index, select) {
            $(this).css("border-color", "white");
            if (!$(this).val()) {
                selected = false;
                $(this).css("border-color", "red");
            }
        });
        if (selected) {
            if (!(checkSameValue($("#left-select"), $("#right-select")))) {
                if ($("#name-merge").val().length == 0) {
                    $("#name-merge").css("border-color", "red");
                } else {
                    mergeTournamentsAJAX($("#left-select").val(), $("#right-select").val(), $("#name-merge").val())
                }
            } else {
                $(this).text("Same Tournaments Chosen");
            }
        } else {
            $(this).text("Select Two Tournaments");
        }
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

function addTournamentRow(tournament) {
    var html = "<tr>";
    html += "<td><a href='/t/" + tournament.shortID + "'>" + tournament.tournament_name + "</a></td>";
    html += "<td>" + tournament.location + "</td>";
    var date = new Date(tournament.date);
    html += ("<td>" + date.getMonth() + "/" + date.getDate() + "/" + date.getFullYear() + "</td>");
    html += "<td>" + tournament.questionSet + "</td>";
    html += "<td>" + tournament.teams.length + "</td>";
    html += "</tr>";
    $(html).hide().appendTo("#tournaments-body").fadeIn(300);
}
