'use strict';

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
        var form = $(this).parent().prev().children("form");
        $(this).prop("disabled", true);
        editPlayerAJAX($(form).serialize(), $(this));
    });

    $(".deleteplayerbutton").click(function(e) {
        var form = $(this).parent().prev().children("form");
        $(this).prop("disabled", true);
        // console.log(form);
        showBeforeSentMessage("Removing Player");
        removePlayerAJAX($(form).serialize(), $(this));
    });

    $(".teamselect").change(function() {
        if ($(this).attr("id") == "leftchoice") {
            getTeamPlayersAJAX("LEFT");
            $("#leftteamnameID").val($(this).find(":selected").text());
        } else {
            getTeamPlayersAJAX("RIGHT");
            $("#rightteamnameID").val($(this).find(":selected").text());
        }
    });

    $("#add-player-button").click(function(e) {
        if ($("#newplayerinput").val().length == 0) {
            showMessageInDiv("#player-add-msg", "Enter a name, please", "zero");
        } else {
            var form = $(this).parent().serialize();
            $(this).prop("disabled", true);
            $("#player-add-msg").empty().
                append("<p style='margin:10px; font-size:16px;'>Adding Player <i class='fa fa-spinner fa-spin'></i></p>");
            addPlayerAJAX(form, $(this));
        }
    });
});

function savePlayerSender(button) {
    var form = $(button).parent().prev().children("form");
    console.log($(form).serialize());
    $(button).prop("disabled", true);
    editPlayerAJAX($(form).serialize());
}

function deletePlayerSender(button) {
    var form = $(button).parent().prev().children("form");
    console.log($(form).serialize());
    $(button).prop("disabled", true);
    removePlayerAJAX($(form).serialize(), button);
}

function showMessageInDiv(div, message, err) {
    var html = "";
    $(div).empty();
    if (err) {
        html = "<p style='margin-left:10px;font-size:18px;color:#ff3300'>" + message + "<i class='fa fa-times-circle' style='margin-left:5px'></i></p>";
    } else {
        html = "<p style='margin-left:10px;font-size:18px;color:#009933'>" + message + "<i class='fa fa-check-circle' style='margin-left:5px'></i></p>";
    }
    $(html).hide().appendTo(div).fadeIn(300);
}

function editGameAJAX() {
    $("#updategamediv").empty().
        append("<p style='margin-left:10px; font-size:16px;'>Updating Game <i class='fa fa-spinner fa-spin'></i></p>");
    $.ajax({
        url : "/tournaments/games/edit",
        type : "POST",
        data : $("#changegameform").serialize(),
        success : function(databack, status, xhr) {
            console.log(databack);
            console.log("Edited game successfully");
            showMessageInDiv("#updategamediv", "Game updated successfully", null);
        },
        error : function(xhr, status, err) {
            if (err == "Unauthorized") {
                showMessageInDiv("#updategamediv", "Hmm, doesn't seem like you're logged in", err);
            } else {
                showMessageInDiv("#updategamediv", "Couldn't connnect to the server!", err);
            }
        }
    });
}

function editTeamAJAX() {
    $.ajax({
        url : "/tournaments/teams/edit",
        type : "POST",
        data : $("#teamdetailsform").serialize(),
        success : function(databack, status, xhr) {
            // showTeamUpdateMsg(databack);
            if (databack.team) {
                showMessageInDiv("#team-update-msgdiv", "Success!", null);
            } else {
                showMessageInDiv("#team-update-msgdiv", "A team with that name already exists!", "exists");
            }
        },
        error : function(xhr, status, err) {
            if (err == "Unauthorized") {
                showMessageInDiv("#team-update-msgdiv", "Doesn't look like you're logged in", err);
            } else {
                showMessageInDiv("#team-update-msgdiv", "Couldn't update team!", err);
            }
        },
        complete : function(databack) {
            $("#editteambutton").prop("disabled", false);
        }
    });
}

function editPlayerAJAX(playerForm, button) {
    showBeforeSentMessage("Saving Player");
    $.ajax({
        url : "/tournaments/players/edit",
        type : "POST",
        data : playerForm,
        success : function(databack, status, xhr) {
            console.log(databack.msg);
            showAfterSentMessage(databack.msg, databack.err);
        },
        error : function(xhr, status, err) {
            if (err == "Unauthorized") {
                showMessageInDiv("#player-add-msg", "Not logged in", err);
            } else {
                showMessageInDiv("#player-add-msg", "Could not update player", err);
            }
        },
        complete : function(databack) {
            $(button).prop("disabled", false);
        }
    });
}

function addPlayerAJAX(playerForm) {
    $.ajax({
        url : "/tournaments/players/create",
        type : "POST",
        data : playerForm,
        success : function(databack, status, xhr) {
            console.log(databack);
            showAddPlayerMsg(databack);
            if (!databack.err) {
                addNewPlayerRow(databack.player, databack.tid);
            }
        },
        error : function(xhr, status, err) {
            if (err == "Unauthorized") {
                showMessageInDiv("#player-add-msg", "Doesn't look like you're logged in", err);
            } else {
                showMessageInDiv("#player-add-msg", "Couldn't add player", err);
            }
        },
        complete : function(data) {
            $("#add-player-button").prop("disabled", false);
        }
    });
}

function removePlayerAJAX(playerForm, button) {
    showBeforeSentMessage("Removing Player");
    $.ajax({
        url : "/tournaments/players/remove",
        type : "POST",
        data : playerForm,
        success : function(databack, status, xhr) {
            if (databack.err) {
                console.log(databack.err);
            } else {
                $(button).parent().parent().remove();
            }
            showAfterSentMessage(databack.msg, databack.err);
        },
        complete : function(databack) {
            $(button).prop("disabled", false);
        }
    })
}

function getTeamPlayersAJAX(side) {
    if (side == "LEFT") {
        $.ajax({
            url : "/tournaments/getplayers",
            type : "GET",
            data : {tournamentid : $("#tournament_id_change").val(),
                    teamname : $("#leftchoice").val()},
            success : function(databack, status, xhr) {
                console.log(databack);
                replacePlayerRows(databack.players, databack.pointScheme, "LEFT");
            }
        });
    } else {
        $.ajax({
            url : "/tournaments/getplayers",
            type : "GET",
            data : {tournamentid : $("#tournament_id_change").val(),
                    teamname : $("#rightchoice").val()},
            success : function(databack, status, xhr) {
                replacePlayerRows(databack.players, databack.pointScheme, "RIGHT");
            }
        });
    }
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

function showAddPlayerMsg(databack) {
    if (databack.err) {
        $("#player-add-msg").empty();
        $("<p style='margin:10px; font-size:16px; color:#ff3300'>" + databack.msg + "<i style='margin-left:5px' class='fa fa-times-circle'></i></p>").
            hide().appendTo("#player-add-msg").fadeIn(300);
    } else {
        $("#player-add-msg").empty();
        $("<p style='margin:10px; font-size:16px; color:#009933'>" + databack.msg + "<i style='margin-left:5px' class='fa fa-check-circle'></i></p>").
            hide().appendTo("#player-add-msg").fadeIn(300);
    }
}

function addNewPlayerRow(player, tid) {
    var html = "<tr>";
    html += "<td><form name='editplayerform'>";
    html += "<input type='hidden' name='tournamentidform' value='" + tid + "'/>";
    html += "<input type='hidden' name='playerid' value='" + player._id + "'>";
    html += "<input type='text' class='form-control' name='playername' value='" + player.player_name + "'/>";
    html += "</form></td>";
    html += "<td>";
    html += "<button type='button' class='btn btn-sm btn-success saveplayerbutton' onclick='savePlayerSender(this)'>Save Name</button>";
    html += "<button type='button' class='btn btn-sm btn-danger deleteplayerbutton' onclick='deletePlayerSender(this)'>Remove</button>";
    html += "</td></tr>";
    $(html).hide().appendTo("#playersbody").fadeIn(300);
}

function replacePlayerRows(players, pointScheme, side) {
    var choice = side == "LEFT" ? "#left-text" : "#right-text";
    var points = Object.keys(pointScheme);
    $(choice).empty();
    var html = "<table class='table table-striped table-bordered table-hover table-condensed'><thead><tr>";
    html += "<th class='table-head'>Name</th>";
    html += "<th class='table-head'>GP</th>";
    for (var i = 0; i < points.length; i++) {
        html += "<th class='table-head'>" + points[i] + "</th>";
    }
    html += "<th class='table-head'>Points</th>";
    html += "</tr></thead><tbody>";
    var playerNum = 1;
    var sideText = side == "LEFT" ? "_left" : "_right";
    for (var i = 0; i < players.length; i++) {
        html += "<tr>";
        html += "<input type='hidden' value='" + players[i]._id +  "' " + "name='" + "player" + playerNum + sideText + "id'" + "/>";
        html += "<td>" + players[i].player_name + "</td>";
        html += "<td> <input class='form-control' type='number' placeholder='GP'" + "value='0' name='" + "player" + playerNum + sideText + "gp'" + "/> </td>";
        for (var j = 0; j < points.length; j++) {
            var keyNameStr = "name='player" + playerNum + sideText + "_" + points[j] + "val' ";
            var keyId = "id='player" + playerNum + "_" + points[j] + sideText + "id' ";
            var json = JSON.stringify(pointScheme);
            var onkeyupString = "onkeyup=";
            onkeyupString += "'updatePoints(";
            onkeyupString += playerNum + ',' + json + ', "' + sideText + '"' + ")' ";
            var onchangeString = "onchange=";
            onchangeString += "'updatePoints(" + playerNum + ',' + json + ', "' + sideText + '"' + ")'";
            html += "<td><input class='form-control' type='number' placeholder='" + points[j] + "'" + keyNameStr + keyId + onkeyupString + onchangeString + "/></td>";
        }
        var idTag = "id='" + playerNum + sideText + "pts'";
        html += "<td> <input " + idTag + "class='form-control disabledview' type='input' placeholder='0' disabled /> </td>";
        html += "</tr>";
        playerNum++;
    }
    html += "</tbody><tfoot><tr></tr></tfoot></table>";
    $(choice).append(html);
}

function showAfterSentMessage(message, err) {
    $("#player-add-msg").empty();
    if (err) {
        $("<p style='margin:10px; font-size:16px; color:#ff3300'>" + message + "<i style='margin-left:5px' class='fa fa-times-circle'></i></p>").
            hide().appendTo("#player-add-msg").fadeIn(300);
    } else {
        $("<p style='margin:10px; font-size:16px; color:#009933'>" + message + "<i style='margin-left:5px' class='fa fa-check-circle'></i></p>").
            hide().appendTo("#player-add-msg").fadeIn(300);
    }
}

function showBeforeSentMessage(message) {
    $("#player-add-msg").empty().
        append("<p style='margin:10px; font-size:16px;'>" + message + "<i class='fa fa-spinner fa-spin'></i></p>");
}
