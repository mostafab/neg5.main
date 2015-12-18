var nextPlayerNum = 5;
var gameOptions;
var teamOptions;
var playerOptions;
var gameList;
var teamList;
var playerList;

$(document).ready(function() {
    gameOptions = { valueNames : ["round", "team1name", "team2name"]};
    gameList = new List("gamediv", gameOptions);

    teamOptions = { valueNames : ["teamname", "division"]};
    teamList = new List("teamdiv", teamOptions);

    playerOptions = { valueNames : []};

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

    $("#add-point-value-button").click(function(e) {

    });

    $("#entergamebutton").click(function(e) {
        // console.log($("#gamedataform").serialize());
        // document.getElementById("gamedataform").reset();
        $(this).prop("disabled", true);
        $("#add-game-message").empty().
            append("<p style='margin-left:10px; font-size:16px;'>Adding Game <i class='fa fa-spinner fa-spin'></i></p>");
        sendGameToServer();
    });

    $(".deletebutton").click(function(e) {
        console.log($(this).parent().serialize());
        removeGame($(this).parent().serialize(), $(this));
    });

    $(".deleteteambutton").click(function(e) {
        // console.log($(this).parent().serialize());
        removeTeam($(this).parent().serialize(), $(this));
    });

    $("#save-point-schema-button").click(function(e) {
        var pointTypes = formatPointTypes();
        formatPointSchemaForm(pointTypes);
        changePointSchemeAJAX(pointTypes);
    });

    $("#save-divisions-button").click(function(e) {
        formatDivisionsForm();
        changeDivisionsAJAX();
    });

    $("#edittournamentbutton").click(function(e) {
        editTournamentAJAX();
    });

    $(".custombutton").click(function(e) {
        // generateCustomStatsAJAX($(this));
        var postURL = $(this).attr("data-post-url");
        console.log(postURL);
        $("#filterstatsform").attr("action", postURL);
        $("#filterstatsform").submit();
    });

    $("#searchcollabbutton").click(function() {
        findDirectorsAJAX()
    });

    $("#searchcollabinput").keypress(function(e) {
        if (e.which == 13) {
            e.preventDefault();
            findDirectorsAJAX();
        }
    });

    $("#addcollabbutton").click(function() {
        // console.log($("#addcollabform").serializeArray());
        addCollaboratorsAJAX();
    });

    $(".removcollab").click(function() {
        removeCollabAJAX(this);
    });

    $("#playerstatstable th").each(function(index, head) {
        // console.log($(head).text());
        playerOptions.valueNames.push($(head).text());
    });
    playerList = new List("players", playerOptions);

    $("#submitregistration").click(function() {
        var empty = checkTournamentRegistration();
        if (!empty) {
            $(this).prop("disabled", true);
            submitTournamentRegistration();
        } else {
            $("#tregmessage").empty().
                append("<p style='margin-left:10px; font-size:18px;'>Fill in all forms, please.</p>");
        }
    });

    $(".pointgroup").click(function() {
        uncheckBoxes($(this));
    });

});

function uncheckBoxes(checkbox) {
    var parentDiv = $(checkbox).parent().parent();
    parentDiv.find(".pointgroup").each(function(index, radio) {
        console.log($(radio)[0] === $(checkbox)[0]);
        if ($(radio)[0] !== $(checkbox)[0]) {
            $(radio).prop("checked", false);
        }
    });
}

function checkTournamentRegistration() {
    var empty = false;
    $("#submitsignup input, #submitsignup textarea").each(function(index, input) {
        if ($(input).val().length == 0) {
            empty = true;
        }
    });
    console.log(empty);
    return empty;
}

function removeTeamSender(button) {
    removeTeam($(button).parent().serialize(), button);
}

function removeGameSender(button) {
    console.log($(button).parent().serialize());
    removeGame($(button).parent().serialize(), button);
}

function submitTournamentRegistration() {
    $("#tregmessage").empty().
        append("<p style='margin-left:10px; font-size:18px;'>Submitting Information <i class='fa fa-spinner fa-spin' style='margin-left:5px'></i></p>");
    $.ajax({
        url : $("#submitsignup").attr("action"),
        type : "POST",
        data : $("#submitsignup").serialize(),
        success : function(databack, status, xhr) {
            if (databack.closed) {
                showMessageInDiv("#tregmessage", "Registration for this tournament is closed!", "CLOSED");
            } else {
                showMessageInDiv("#tregmessage", "All good to go!", null);
            }
        },
        error : function(xhr, status, err) {
            showMessageInDiv("#tregmessage", "Couldn't connect to the server!", err);
        },
        complete : function(xhr, status) {
            $("#submitregistration").prop("disabled", false);
        }
    });
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
            $("#add-game-message").empty();
            if (databack.game) {
                updateGameList(databack);
                $("<p style='margin-left:10px; font-size:16px; color:#009933'>Successfully added game <i class='fa fa-check-circle'></i></p>").
                    hide().appendTo("#add-game-message").fadeIn(300);
            } else {
                $("<p style='margin-left:10px; font-size:16px; color:#ff3300'>Couldn't add game<i class='fa fa-times-circle'></i></p>").
                    hide().appendTo("#add-game-message").fadeIn(300);
            }
        },
        complete : function(databack) {
            $("#entergamebutton").prop("disabled", false);
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

function changePointSchemeAJAX(pointTypes) {

    $.ajax({
        url : "/home/tournaments/editPointSchema",
        type : "POST",
        data : $("#point-schema-form").serialize(),
        success : function(databack, status, xhr) {
            // console.log("HERE");
        }
    });
}

function changeDivisionsAJAX() {
    $.ajax({
        url : "/home/tournaments/editDivisions",
        type : "POST",
        data : $("#divisions-form").serialize(),
        success : function(databack, status, xhr) {

        }
    });
}

function editTournamentAJAX() {
    $("#tournament-update-msgdiv").empty().
        append("<p style='margin-left:10px; margin-right:10px; font-size:16px;'>Editing<i class='fa fa-spinner fa-spin' style='margin-left:10px'></i></p>");
    $.ajax({
        url : "/home/tournaments/edit",
        type : "POST",
        data : $("#tournament-overview-form").serialize(),
        success : function(databack, status, xhr) {
            showMessageInDiv("#tournament-update-msgdiv", "Successfully updated tournament", null);
        },
        error : function(xhr, status, err) {
            showMessageInDiv("#tournament-update-msgdiv", "Couldn't update tournament", err);
        }
    });
}

function generateCustomStatsAJAX(button) {
    var postURL = $(button).attr("data-post-url");
    $("#customstatsdiv").empty().
        append("<p style='margin-left:10px; margin-right:10px; font-size:16px;'>Generating Stats <i class='fa fa-spinner fa-spin'></i></p>");

    $.ajax({
        url : postURL,
        type : "POST",
        data : $("#filterstatsform").serialize(),
        success : function(databack, status, xhr) {
            if (databack.type == "team") {
                displayTeamCustomStats(databack);
            } else if (databack.type == "player") {
                console.log(databack);
            }
        }
    });
}

function findDirectorsAJAX() {
    $.ajax({
        url : "/tournaments/findDirectors",
        type : "GET",
        data : $("#searchcollabform").serialize(),
        success : function(databack, status, xhr) {
            $("#directorsoptions").empty();
            var html = "";
            for (var i = 0; i < databack.directors.length; i++) {
                var obj = {name : databack.directors[i].name, email : databack.directors[i].email, id : databack.directors[i]._id};
                // html += "<option value="{'name' : " + databack.directors[i].name + ", email : " + databack.directors[i].email + "}">";
                html += "<option value='" + JSON.stringify(obj) + "'>";
                html += databack.directors[i].name + " (" + databack.directors[i].email + ")";
                html += "</option>";
            }
            $("#directorsoptions").append(html);
        }
    });
}

function addCollaboratorsAJAX() {
    $.ajax({
        url : "/tournaments/addCollaborator",
        type : "POST",
        data : $("#addcollabform").serialize(),
        success : function(databack, status, xhr) {
            if (!databack.err && !databack.duplicate) {
                addCollaboratorBox(databack.collab)
            } else if (databack.err) {

            } else {

            }
        }
    });
}

function removeCollabAJAX(button) {
    $.ajax({
        url : "/tournaments/removeCollab",
        type : "POST",
        data : {tournamentid : $("#tournamentshortid").val(), collab : $(button).attr("data-collabid")},
        success : function(databack, status, xhr) {
            if (databack.err == null) {
                removeCollabBox(button);
            } else {

            }
        }
    });
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

function removeCollabBox(button) {
    $(button).parent().fadeOut(300, function() {
        $(this).remove();
    });
}

function addCollaboratorBox(collaborator) {
    var html = "<div class='col-md-3 statbox' style='border-radius:0;padding-bottom:20px'>";
    html += "<p>Name : " + collaborator.name + "</p>";
    html += "<p>Email : " + collaborator.email + "</p>";
    html += "<button class='btn btn-md btn-danger' style='margin-top:20px' onclick='removeCollabAJAX(this)' data-collabid='"
        + collaborator.id + "'>Remove</button>";
    html += "</div>";
    $(html).hide().appendTo("#collaboratorsdiv").fadeIn(300);
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
    html += "<th class='table-head'>Points</th>";
    html += "</tr></thead><tbody>";
    var playerNum = 1;
    var sideText = side == "LEFT" ? "_left" : "_right";
    for (var i = 0; i < players.length; i++) {
        html += "<tr>";
        html += "<input type='hidden' value='" + players[i]._id +  "' " + "name='" + "player" + playerNum + sideText + "id'" + "/>";
        html += "<td>" + players[i].player_name + "</td>";
        html += "<td> <input class='form-control' type='number' placeholder='GP'" + "value='1' name='" + "player" + playerNum + sideText + "gp'" + "/> </td>";
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
    html += "<td> <form> <input type='hidden' name='gameid_form' value='" + game.shortID + "'/>";
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
    html += "<td> <form><input type='hidden' name='teamid_form' value='" + team.shortID + "'/>";
    html += "<input type='hidden' name='tournament_idteam' value='" + $("#tournament_id_change").val() + "'/>";
    html += "<a class='btn btn-sm btn-info' href='/home/tournaments/" + $("#tournamentshortid").val() + "/teams/" + team.shortID + "'> Details </a>";
    html += "<button type='button' class='btn btn-sm btn-warning deleteteambutton' onclick='removeTeamSender(this)'> Remove Team </button>";
    html += "</form></td></tr>";
    $("#teamtablebody").append(html);
}

function addPointSchemaRow() {
    var arr = ["B", "N", "P"];
    var html = "<div class='row'><div class='form-group col-md-3'><input type='number style='width:100%' class='form-control pointval input-medium no-border-radius'/></div>";
    html += "<div class='col-md-9'>";
    for (var i = 0; i < arr.length; i++) {
        if (arr[i] == "P") {
            html += "<label class='radio-inline btn-sm btn-warning'>Power<input type='checkbox' value='" + arr[i] + "' class='pointgroup' style='margin-left:5px' onclick='uncheckBoxes(this)'/></label>";
        } else if (arr[i] == "N") {
            html += "<label class='radio-inline btn-sm btn-danger'>Neg<input type='checkbox' value='" + arr[i] + "' class='pointgroup' style='margin-left:5px' onclick='uncheckBoxes(this)'/></label>";
        } else {
            html += "<label class='radio-inline btn-sm btn-info'>Base<input checked type='checkbox' value='" + arr[i] + "' class='pointgroup' style='margin-left:5px' onclick='uncheckBoxes(this)'/></label>";
        }
    }
    html += "</div>";
    $("#point-schema-form").append(html);
}

function addDivisionRow() {
    var html = "<div class='form-group'><input type='text' style='width:50%' class='form-control input-medium no-border-radius'/></div>";
    $("#divisions-form").append(html);
}

function formatPointSchemaForm(pointTypes) {
    var currentPointNum = 1;
    $("#point-schema-form .pointval").each(function() {
        if ($(this).attr("name") !== "tournamentid") {
            $(this).attr("name", "pointval" + currentPointNum);
            console.log($(this).val() + ", " + $(this).attr("name"));
            currentPointNum++;
        }
    });
    $("#pointtypesfield").val(JSON.stringify(pointTypes));
}

function formatPointTypes() {
    var pointTypes = {};
    $("#point-schema-form .pointval").each(function(index) {
        if ($(this).val() != "") {
            var pointValue = $(this).val();
            console.log($(this).val());
            $(this).parent().next().find(".pointgroup").each(function(index, radio) {
                if ($(radio).is(":checked")) {
                    pointTypes[pointValue] = $(radio).val();
                }
            });
        }
    });
    // console.log(pointTypes);
    return pointTypes;
}

function formatDivisionsForm() {
    var currentDivisonNum = 1;
    $("#divisions-form :input").each(function() {
        if ($(this).attr("name") !== "tournamentid") {
            $(this).attr("name", "division" + currentDivisonNum);
            console.log($(this).val() + ", " + $(this).attr("name"));
            currentDivisonNum++;
        }
    });
}

function displayTeamCustomStats(teamData) {
    $("#customstatsdiv").empty();
    var teamInfo = teamData.teamInfo;
    var tournament = teamData.tournament;
    var points = Object.keys(tournament.pointScheme);
    var html = "";
    if (tournament.divisions.length == 0) {
        if (teamInfo.length != 0) {
            var statHeaders = Object.keys(teamInfo[0].stats);
            html += "<div class='panel panel-default'><table class='table table-striped table-bordered table-hover table-condensed'>";
            html += "<thead><tr>";
            for (var i = 0; i < statHeaders.length; i++) {
                if (statHeaders[i] == "pointTotals") {
                    for (var j = 0; j < points.length; j++) {
                        html += "<th class='table-head'>" + points[j] + "</th>";
                    }
                } else {
                    html += "<th class='table-head'>" + statHeaders[i] + "</th>";
                }
            }
            html += "</tr></thead><tbody>";
            for (var i = 0; i < teamInfo.length; i++) {
                html += "<tr>";
                for (var j = 0; j < statHeaders.length; j++) {
                    if (statHeaders[j] == "pointTotals") {
                        for (var k = 0; k < points.length; k++) {
                            html  += "<td>" + teamInfo[i].stats.pointTotals[points[k]] + "</td>";
                        }
                    } else {
                        html += "<td>" + teamInfo[i].stats[statHeaders[j]] + "</td>";
                    }
                }
                html += "</tr>";
            }
            html += "</tbody></table></div>";
        }
    } else {
        for (var x = 0; x < tournament.divisions.length; x++) {
            html += "<h2 class='title' style='width:20%';border-radius:0px>" + tournament.divisions[x] + "</h2>";
            if (teamInfo.length != 0) {
                var statHeaders = Object.keys(teamInfo[0].stats);
                html += "<div class='panel panel-default'><table class='table table-striped table-bordered table-hover table-condensed'>";
                html += "<thead><tr>";
                for (var i = 0; i < statHeaders.length; i++) {
                    if (statHeaders[i] == "pointTotals") {
                        for (var j = 0; j < points.length; j++) {
                            html += "<th class='table-head'>" + points[j] + "</th>";
                        }
                    } else {
                        html += "<th class='table-head'>" + statHeaders[i] + "</th>";
                    }
                }
                html += "</tr></thead>";
                html += "<tbody>"
                for (var i = 0; i < teamInfo.length; i++) {
                    if (teamInfo[i].stats["Division"] == tournament.divisions[x]) {
                        html += "<tr>";
                        for (var j = 0; j < statHeaders.length; j++) {
                            if (statHeaders[j] == "pointTotals") {
                                for (var k = 0; k < points.length; k++) {
                                    html  += "<td>" + teamInfo[i].stats.pointTotals[points[k]] + "</td>";
                                }
                            } else {
                                html += "<td>" + teamInfo[i].stats[statHeaders[j]] + "</td>";
                            }
                        }
                        html += "</tr>";
                    }
                }
                html += "</tbody></table></div>"
            }
        }
    }
    $(html).hide().appendTo("#customstatsdiv").fadeIn(300);
}
