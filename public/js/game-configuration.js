$(document).ready(function() {

    $("#entergamebutton").click(function(e) {
        // console.log($("#changegameform").serialize());
        editGameAJAX();
    });

    $("#editteambutton").click(function(e) {
        $(this).prop("disabled", true);
        $("#team-update-msgdiv").empty().
            append("<p style='margin:10px; font-size:16px;'>Saving Team <i class='fa fa-spinner fa-spin'></i></p>");
        editTeamAJAX();
    });

    $(".saveplayerbutton").click(function(e) {
        // console.log($(this).parent().prev().prev());
        var form = $(this).parent().prev().prev();
        // console.log($(form).serialize());
        editPlayerAJAX($(form).serialize());
    });

    $(".deleteplayerbutton").click(function(e) {
        var form = $(this).parent().prev().prev();
        removePlayerAJAX($(form).serialize(), $(this));
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
        },
        complete : function(databack) {
            $("#editteambutton").prop("disabled", false);
        }
    });
}

function editPlayerAJAX(playerForm) {
    $.ajax({
        url : "/home/tournaments/players/edit",
        type : "POST",
        data : playerForm,
        success : function(databack, status, xhr) {
            if (databack.err) {
                console.log(databack.msg);
            } else {
                console.log(databack.msg);
            }
        }
    });
}

function removePlayerAJAX(playerForm, button) {
    $.ajax({
        url : "/home/tournaments/players/remove",
        type : "POST",
        data : playerForm,
        success : function(databack, status, xhr) {
            if (databack.err) {
                console.log(databack.err);
            } else {
                $(button).parent().parent().remove();
            }
        }
    })
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
