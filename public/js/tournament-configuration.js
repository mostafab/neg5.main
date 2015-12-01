var nextPlayerNum = 5;
var gameOptions;
var teamOptions;
var gameList;
var teamList;

$(document).ready(function() {
    gameOptions = { valueNames : ["round", "team1name", "team2name"]};
    gameList = new List("gamediv", gameOptions);

    teamOptions = { valueNames : ["teamname", "division"]};
    teamList = new List("teamdiv", teamOptions);

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

    $("#entergamebutton").click(function(e) {
        // console.log($("#gamedataform").serialize());
        // document.getElementById("gamedataform").reset();
        sendGameToServer();
    });

    $(".deletebutton").click(function(e) {
        console.log($(this).parent().serialize());
        removeGame($(this).parent().serialize(), $(this));
    });

    $(".deleteteambutton").click(function(e) {
        console.log($(this).parent().serialize());
        removeTeam($(this).parent().serialize(), $(this));
    });

});

function removeTeamSender(button) {
    removeTeam($(button).parent().serialize(), button);
}

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
            if (databack["teams"] && databack["newTeam"]) {
                updateTeamSelectionList(databack["teams"]);
                updateTeamList(databack["newTeam"]);
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
                generatePlayerRows(databack.players, databack.pointScheme, "LEFT");
            }
        });
    } else {
        $.ajax({
            url : "/home/tournaments/getplayers",
            type : "GET",
            data : {tournamentid : $("#tournament_id_change").val(),
                    teamname : $("#rightchoice").val()},
            success : function(databack, status, xhr) {
                generatePlayerRows(databack.players, databack.pointScheme, "RIGHT");
            }
        });
    }
}

function removeGame(forminfo, button) {
    $.ajax({
        url : "/home/tournaments/games/remove",
        type : "POST",
        data : forminfo,
        success : function(databack, status, xhr) {
            console.log("Success : " + databack);
            $(button).parent().parent().parent().remove();
        }
    });
}

function removeTeam(forminfo, button) {
    $.ajax({
        url : "/home/tournaments/teams/remove",
        type : "POST",
        data : forminfo,
        success : function(databack, status, xhr) {
            console.log(databack);
            $(button).parent().parent().parent().remove();
            var teamid = databack.teamid;
            console.log(teamid);
            if (teamid) {
                $("#leftchoice option[value='" + teamid + "']").remove();
                $("#rightchoice option[value='" + teamid + "']").remove();
            }
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

function generatePlayerRows(players, pointScheme, side) {
    var choice = side == "LEFT" ? "#left-text" : "#right-text";
    var points = Object.keys(pointScheme);
    $(choice).empty();
    var html = "<table class='table table-striped table-bordered table-hover table-condensed'><thead><tr>";
    html += "<th class='table-head'>Name</th>";
    html += "<th class='table-head'>GP</th>";
    for (var i = 0; i < points.length; i++) {
        html += "<th class='table-head'>" + points[i] + "</th>";
    }
    // html += "<th class='table-head'>10</th>";
    // html += "<th class='table-head'>15</th>";
    // html += "<th class='table-head'>-5</th>";
    html += "<th class='table-head'>Points</th>";
    html += "</tr></thead><tbody>";
    var playerNum = 1;
    var sideText = side == "LEFT" ? "_left" : "_right";
    for (var i = 0; i < players.length; i++) {
        // console.log(points);
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

/**
* Updates the selection drop-down menu of teams after the ajax call
* to add a new team
* @param teams list of all teams returned as an array
*/
function updateTeamSelectionList(teams) {
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
    html += "<td> <form role='form'> <input type='hidden' name='gameid_form' value='" + game.shortID + "'/>";
    html += "<input type='hidden' name='tournament_idgame' value='" + id + "'/>";
    html += "<a class='btn btn-sm btn-info editbutton' href='/home/tournaments/" + $("#tournamentshortid").val() + "/games/" + game.shortID + "'> Details </a>";
    html += "<button type='button' class='btn btn-sm btn-warning deletebutton' onclick='removeGameSender(this)'> Remove Game </button>";
    html += "</form> </td>";
    html += "</tr>";
    $("#gametablebody").append(html);
    gameList = new List("gamediv", gameOptions);
}

function updateTeamList(team) {
    console.log(team);
    var html = "<tr>";
    html += "<td>" + team.team_name + "</td>";
    html += "<td>" + team.division + "</td>";
    html += "<td> <form role='form'><input type='hidden' name='teamid_form' value='" + team.shortID + "'/>";
    html += "<input type='hidden' name='tournament_idteam' value='" + $("#tournament_id_change").val() + "'/>";
    html += "<a class='btn btn-sm btn-info' href='/home/tournaments/" + $("#tournamentshortid").val() + "/teams/" + team.shortID + "'> Details </a>";
    html += "<button type='button' class='btn btn-sm btn-warning deleteteambutton' onclick='removeTeamSender(this)'> Remove Team </button>";
    html += "</form></td></tr>";
    $("#teamtablebody").append(html);
}
