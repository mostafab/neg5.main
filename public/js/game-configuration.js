$(document).ready(function() {

    $("#entergamebutton").click(function(e) {
        // console.log($("#changegameform").serialize());
        editGameAJAX();
    });

    $("#editteambutton").click(function(e) {
        editTeamAJAX();
    });

    $(".saveplayerbutton").click(function(e) {
        // console.log($(this).parent().prev().prev());
        console.log($(this).parent().parent().parent());
        console.log($(this).parent().parent().parent().serialize());
        editPlayerAJAX($(this).parent().parent().parent());
    });

});


function editGameAJAX() {
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

function editTeamAJAX() {
    $.ajax({
        url : "/home/tournaments/teams/edit",
        type : "POST",
        data : $("#teamdetailsform").serialize(),
        success : function(databack, status, xhr) {
            showTeamUpdateMsg(databack);
        }
    });
}

function editPlayerAJAX(playerForm) {
    // console.log(playerForm);
    $.ajax({
        url : "/home/tournaments/players/edit",
        type : "POST",
        data : playerForm.serialize(),
        success : function(databack, status, xhr) {

        }
    });
}

function showTeamUpdateMsg(databack) {
    if (databack.err || !databack.team) {
        $("#team-update-msgdiv").empty();
        $("<p style='margin:10px; font-size:16px; color:#ff3300'>" + databack.msg + "<i style='margin-left:5px' class='fa fa-times-circle'></i></p>").
            hide().appendTo("#team-update-msgdiv").fadeIn(300);
    } else {
        $("#team-update-msgdiv").empty();
        $("<p style='margin:10px; font-size:16px; color:#009933'>" + databack.msg + "<i style='margin-left:5px' class='fa fa-check-circle'></i></p>").
            hide().appendTo("#team-update-msgdiv").fadeIn(300);
    }
}
