var nextPlayerNum = 5;
var options;
var gameList;

$(document).ready(function() {

    options = { valueNames : ["round", "team1name", "team2name"]};
    gameList = new List("gamediv", options);

    $("#entergamebutton").prop("disabled", true);
    $("#entergamebutton").removeClass("btn-success").addClass("btn-danger");

    $(".collapsable").click(function(e) {
        e.stopImmediatePropagation();
        $(this).next().toggle(300);
    });

    $("#add-team-button").click(function(e) {
        sendTeamToServer();
    });

    $("#team_name_input").keyup(function(e) {
        var teamname = $("#team_name_input").val().trim();
        $("#player_team_dynamic").val(teamname);
    });

    $("#newlineplayer").click(function(e) {
        createPlayerInputField();
    });

    $(".teamselect").change(function(e) {
        if ($(this).attr("id") == "leftchoice") {
            findPlayersByTeamnameAndTournament("LEFT");
            $("#leftteamnameID").val($(this).find(":selected").text());
            // console.log($("#leftteamnameID").val());
        } else {
            findPlayersByTeamnameAndTournament("RIGHT");
            $("#rightteamnameID").val($(this).find(":selected").text());
        }
    });

    $("#entergamebutton").click(function(e) {
        // console.log($("#gamedataform").serialize());
        // document.getElementById("gamedataform").reset();
        sendGameToServer();
    });

    $(".teamselect").on("change", function(e) {
        var bothselect = true;
        $(".teamselect").each(function(i, obj) {
            if ($(this).val() === "") {
                $("#entergamebutton").prop("disabled", true);
                $("#entergamebutton").removeClass("btn-success").addClass("btn-danger");
                bothselect = false;
            }
        });
        if (bothselect) {
            $("#entergamebutton").prop("disabled", false);
            $("#entergamebutton").removeClass("btn-danger").addClass("btn-success");
        }
    });

    $(".deletebutton").click(function(e) {
        console.log($(this).parent().serialize());
        removeGame($(this).parent().serialize(), $(this));
    });

    $(".modal-wide").on("show.bs.modal", function() {
        var height = $(window).height() - 300;
        $(this).find(".modal-body").css("max-height", height);
    });

});

function removeGameSender(button) {
    console.log($(button).parent().serialize());
    removeGame($(button).parent().serialize(), button);
}

function sendTeamToServer() {
    $.ajax({
        url : "/home/tournaments/createteam",
        type : "POST",
        data : $("#teamform").serialize(),
        success : function(databack, status, xhr) {
            // document.getElementById("teamform").reset();
            if (databack !== null) {
                updateTeamList(databack);
            }
        }
    });
}

function sendGameToServer() {
    $.ajax({
        url : "/home/tournaments/creategame",
        type : "POST",
        data : $("#gamedataform").serialize(),
        success : function(databack, status, xhr) {
            console.log(databack);
            updateGameList(databack);
            // document.getElementById("gamedataform").reset();
        }
    });
}

function sendPlayersToServer() {
    $.ajax({
        url : "/home/tournaments/createplayers",
        type : "POST",
        data : $("#playersform").serialize(),
        success : function(databack, status, xhr) {

        }
    });
}

function findPlayersByTeamnameAndTournament(side) {
    if (side == "LEFT") {
        $.ajax({
            url : "/home/tournaments/getplayers",
            type : "GET",
            data : {tournamentid : $("#tournament_id_change").val(),
                    teamname : $("#leftchoice").val()},
            success : function(databack, status, xhr) {
                console.log(databack);
                generatePlayerRows(databack, "LEFT");
            }
        });
    } else {
        $.ajax({
            url : "/home/tournaments/getplayers",
            type : "GET",
            data : {tournamentid : $("#tournament_id_change").val(),
                    teamname : $("#rightchoice").val()},
            success : function(databack, status, xhr) {
                generatePlayerRows(databack, "RIGHT");
            }
        });
    }
}

function removeGame(gameid, button) {
    $.ajax({
        url : "/home/tournaments/games/remove",
        type : "POST",
        data : gameid,
        success : function(databack, status, xhr) {
            console.log("Success : " + databack);
            $(button).parent().parent().parent().remove();
        }
    });
}

function createPlayerInputField() {
    var newInput = "<input type='text'/>";
    var classes = "form-control input-medium center-text no-border-radius";
    var name = "player" + nextPlayerNum + "_name";
    var placeholder = "Player " + nextPlayerNum;
    var autocomplete = "off";
    $(newInput).attr("class", classes).attr("name", name).attr("placeholder", placeholder)
        .attr("autocomplete", autocomplete).appendTo("#player-dynamic");
    nextPlayerNum++;
}

function generatePlayerRows(players, side) {
    var choice = side == "LEFT" ? "#left-text" : "#right-text";
    $(choice).empty();
    var html = "<table class='table table-striped table-bordered table-hover table-condensed'><thead><tr>";
    html += "<th class='table-head'>Name</th>";
    html += "<th class='table-head'>GP</th>";
    html += "<th class='table-head'>10</th>";
    html += "<th class='table-head'>15</th>";
    html += "<th class='table-head'>-5</th>";
    html += "<th class='table-head'>Points</th>";
    html += "</tr></thead><tbody>";
    var playerNum = 1;
    var sideText = side == "LEFT" ? "_left" : "_right";
    for (var i = 0; i < players.length; i++) {
        html += "<tr>";
        html += "<input type='hidden' value='" + players[i]._id +  "' " + "name='" + "player" + playerNum + sideText + "id'" + "/>";
        html += "<td>" + players[i].player_name + "</td>";
        html += "<td> <input class='form-control' type='number' placeholder='GP'" + "value='0' name='" + "player" + playerNum + sideText + "gp'" + "/> </td>";
        for (key in players[i].pointValues) {
            var keyNameStr = "name='player" + playerNum + sideText + "_" + key + "val' ";
            var keyId = "id='player" + playerNum + "_" + key + sideText + "id' ";
            var json = JSON.stringify(players[i].pointValues);
            var onkeyupString = "onkeyup=";
            onkeyupString += "'updatePoints(";
            onkeyupString += playerNum + ',' + json + ', "' + sideText + '"' + ")' ";
            var onchangeString = "onchange=";
            onchangeString += "'updatePoints(" + playerNum + ',' + json + ', "' + sideText + '"' + ")'";
            html += "<td><input class='form-control' type='number' placeholder='" + key + "'" + keyNameStr + keyId + onkeyupString + onchangeString + "/></td>";
        }
        var idTag = "id='" + playerNum + sideText + "pts'";
        html += "<td> <input " + idTag + "class='form-control disabledview' type='input' placeholder='0' disabled /> </td>";
        html += "</tr>";
        playerNum++;
    }
    html += "</tbody><tfoot><tr></tr></tfoot></table>";
    $(choice).append(html);
}

function updatePoints(num, pointvalues, side) {
    var total = 0;
    for (key in pointvalues) {
        var inputField = "player" + num + "_" + key + side + "id";
        var inputVal = $("#" + inputField).val();
        if (!isNaN(parseInt(inputVal))) {
            total += parseInt(inputVal) * parseInt(key);
        }
    }
    var ptLabelId = "#" + num + side + "pts";
    $(ptLabelId).val(total);
}

function updateTeamList(teams) {
    $("#left-text").empty();
    $("#right-text").empty();
    $("#leftchoice").empty();
    $("#rightchoice").empty();
    var defaultChoiceLeft = "<option selected value=''> </option> ";
    $("#leftchoice").append(defaultChoiceLeft);
    var defaultChoiceRight = "<option selected value=''>  </option> ";
    $("#rightchoice").append(defaultChoiceRight);
    for (var i = 0; i < teams.length; i++) {
        var option = "<option value='" + teams[i]._id + "'>" + teams[i].team_name + "</option>";
        $("#leftchoice").append(option);
        $("#rightchoice").append(option);
    }
}

function updateGameList(gameinfo) {
    var game = gameinfo.game;
    var id = gameinfo.tid;
    var html = "<tr>";
    html += "<td>" + game.round + "</td>";
    html += "<td>" + game.team1.team_name + "</td>";
    html += "<td>" + game.team1.score + "</td>";
    html += "<td>" + game.team2.team_name + "</td>";
    html += "<td>" + game.team2.score + "</td>";
    html += "<td>" + game.tossupsheard + "</td>";
    html += "<td> <form role='form'> <input type='hidden' name='gameid_form' value='" + game._id + "'/>";
    html += "<input type='hidden' name='tournament_idgame' value='" + id + "'/>";
    html += "<a class='btn btn-sm btn-info editbutton' href='/home/tournaments/" + id + "/games/" + game._id + "'> Details </a>";
    html += "<button type='button' class='btn btn-sm btn-warning deletebutton' onclick='removeGameSender(this)'> Remove Game </button>";
    html += "</form> </td>";
    html += "</tr>";
    $("#gametablebody").append(html);
    gameList = new List("gamediv", options);
}
