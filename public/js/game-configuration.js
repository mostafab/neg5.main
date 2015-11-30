$(document).ready(function() {

    $("#entergamebutton").click(function(e) {
        // console.log($("#changegameform").serialize());
        editGame();
    });

    $("#editteambutton").click(function(e) {
        editTeam();
    });
});


function editGame() {
    $.ajax({
        url : "/home/tournaments/games/edit",
        type : "POST",
        data : $("#changegameform").serialize(),
        success : function(databack, status, xhr) {
            console.log(databack);
            console.log("Edited game successfully");
            $("#oldgameid_input").val(databack.shortID);
        }
    });
}

function editTeam() {
    $.ajax({
        url : "/home/tournaments/teams/edit",
        type : "POST",
        data : $("#teamdetailsform").serialize(),
        success : function(databack, status, xhr) {
            showTeamUpdateMsg(databack);
        }
    });
}

function showTeamUpdateMsg(databack) {
    if (databack.err) {

    } else if (!databack.team) {
        $("#team-update-msgdiv").empty();
        $("<p style='margin:10px; font-size:18px; color:#ff3300'>" + databack.msg + "</p>").
            hide().appendTo("#team-update-msgdiv").fadeIn(300);
    } else {
        $("#team-update-msgdiv").empty();
        $("<p style='margin:10px; font-size:18px; color:#009933'>" + databack.msg + "</p>").
            hide().appendTo("#team-update-msgdiv").fadeIn(300);
        // $("#team-update-msgdiv").empty().
        //     append("<p style='margin:10px; font-size:18px; color:#009933'>" + databack.msg + "</p>").delay(200).fadeIn();
    }
}
