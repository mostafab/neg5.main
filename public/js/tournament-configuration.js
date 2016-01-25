var nextPlayerNum = 5;
var gameOptions;
var teamOptions;
var playerOptions;
var gameList;
var teamList;
var playerList;

var entityMap = {
   "&": "&amp;",
   "<": "&lt;",
   ">": "&gt;",
   '"': '&quot;',
   "'": '&#39;',
   "/": '&#x2F;'
 };

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
        $("#team_name_input").css("border-color", "white");
        if ($("#team_name_input").val().length !== 0) {
            $(this).prop("disabled", true);
            sendTeamToServer();
        } else {
            $("#team_name_input").css("border-color", "red");
        }
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
        // document.getElementById("gamedataform").reset();
        var wrong = false;
        $(".point-box").each(function() {
            $(this).removeClass("alert-danger");
            if ($(this).val()) {
                var val = parseFloat($(this).val());
                if (val < 0 || Math.floor(val) - val !== 0) {
                    wrong = true;
                    $(this).addClass("alert-danger");
                }
            }
        });
        $(".gp-box").each(function() {
            $(this).removeClass("alert-danger");
            if ($(this).val()) {
                var val = parseFloat($(this).val());
                if (val < 0 || val > 1) {
                    wrong = true;
                    $(this).addClass("alert-danger");
                }
            } else {
                wrong = true;
                $(this).addClass("alert-danger");
            }
        });
        $(".scorebox").each(function() {
            $(this).removeClass("alert-danger");
            if (!$(this).val()) {
                wrong = true;
                $(this).addClass("alert-danger");
            }
        });
        $(".teamselect").removeClass("alert-danger");
        if ($("#leftchoice").val() === $("#rightchoice").val()) {
            wrong = true;
            $(".teamselect").addClass("alert-danger");
        }
        if (!wrong) {
            $(this).prop("disabled", true);
            $("#add-game-message").empty().
                append("<p style='margin-left:10px; font-size:16px;color:black;'>Adding Game <i class='fa fa-spinner fa-spin'></i></p>");
            $("#updategamediv").empty().
                append("<p style='margin-left:10px; font-size:16px;color:black;'>Adding Game <i class='fa fa-spinner fa-spin'></i></p>");
            sendGameToServer();
        }
    });

    $(".deletebutton").click(function(e) {
        removeGame($(this).parent().serialize(), $(this));
    });

    $("body").on("click", ".start-delete-team", function() {
        $(this).parents("tr").next().slideDown(0);
    });

    $("body").on("click", ".cancel-delete-team", function() {
        $(this).parents("tr").slideUp(0);
    });

    $("body").on("click", ".deleteteambutton", function() {
        // console.log($(this).parent());
        removeTeam($(this).parent().serialize(), $(this));
    });

    // $(".deleteteambutton").click(function(e) {
    //
    // });

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
        // console.log(postURL);
        $("#filterstatsform").attr("action", postURL);
        $("#filterstatsform").submit();
    });

    $("#searchcollabbutton").click(function() {
        if ($("#searchcollabinput").val().length > 0) {
            findDirectorsAJAX();
        }
    });

    $("#searchcollabinput").keypress(function(e) {
        if (e.which == 13) {
            e.preventDefault();
            if ($(this).val().length > 0) {
                findDirectorsAJAX();
            }
        }
    });

    $("#addcollabbutton").click(function() {
        if ($("#directorsoptions").val()) {
            addCollaboratorsAJAX();
        }
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
            var numTeams = parseFloat($("#team-number-s").val());
            if (numTeams >= 1 && numTeams - Math.floor(numTeams) == 0) {
                $(this).prop("disabled", true);
                submitTournamentRegistration();
            } else {
                $("#tregmessage").empty().
                    append("<p style='margin-left:10px; font-size:18px;'>Enter a valid number of teams.</p>");
            }
        } else {
            $("#tregmessage").empty().
                append("<p style='margin-left:10px; font-size:18px;'>Fill in all forms, please.</p>");
        }
    });

    $(".pointgroup").click(function() {
        uncheckBoxes($(this));
    });

    $(".cancel-reg").click(function() {
        $(this).parents("tr").next("tr").slideDown(0);
    });

    $(".cancel-delete-reg").click(function() {
        $(this).parents("tr").slideUp(0);
    });

    $(".confirm-delete-reg").click(function() {
        deleteRegistrationAJAX($(this));
    });

    /*
    * Download stats
    */
    $(".download").click(function(e) {
        e.preventDefault();
        downloadStats($(this));
    });

    $("#download-json").click(function(e) {
        e.preventDefault();
        downloadJSON($(this));
    });

    $("#download-scoresheets").click(function(e) {
        e.preventDefault();
        downloadScoresheets($(this));
    });

    // $("#download-sqbs").click(function(e) {
    //     e.preventDefault();
    //     downloadSQBS($(this));
    // });

    $("#new-phase").click(function() {
        $("#new-phase-name").css("border-color", "white");
        // console.log($("#new-phase-name").val());
        if ($("#new-phase-name").val().length !== 0) {
            makePhaseAJAX($(this).attr("data-tournament"), escapeHtml($("#new-phase-name").val()));
        } else {
            $("#new-phase-name").css("border-color", "red");
        }
    });

    $("#delete-tournament-button").click(function() {
        // console.log("Deleting...");
        $("#confirm-delete-div").slideDown(300);
    })

    $("#no-delete").click(function() {
        $("#confirm-delete-div").slideUp(300);
    })

    $("#yes-delete").click(function() {
        document.deleteTournament.submit();
    });

});

function uncheckBoxes(checkbox) {
    var parentDiv = $(checkbox).parent().parent();
    parentDiv.find(".pointgroup").each(function(index, radio) {
        // console.log($(radio)[0] === $(checkbox)[0]);
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
    // console.log(empty);
    return empty;
}

function removeTeamSender(button) {
    removeTeam($(button).parent().serialize(), button);
}

function removeGameSender(button) {
    // console.log($(button).parent().serialize());
    removeGame($(button).parent().serialize(), button);
}

function rebuildScoresheet(round, scoresheetInfo, pointScheme) {
    var styles = "* { font-family: 'Verdana', sans-serif;} body { padding:50px;" +
        "} td { padding:2px;} .header { font-weight:bold; } table { font-size: 14px;" +
        "width: 100%;} table, th, td { border: 1px solid black;} .outer-list .inner-list{display:inline;}";

    var title = scoresheetInfo.team1.name + " vs " + scoresheetInfo.team2.name + " | Round " + round;
    var html = "<!DOCTYPE html><html><head><title>" + title + "</title>"
    html += "<style>" + styles + "</style></head>";
    html += "<body>";
    html += "<h3>" + title + "</h3>";
    // Metadata table
    html += "<table><tbody><tr><td class='header'>Team 1</td><td class='header'>Score</td><td class='header'>" +
        "Team 2</td><td class='header'>Score</td><td class='header'>Round</td><td class='header'>Moderator</td><td class='header'>Packet</td></tr>";
    html += "<tr><td>" + scoresheetInfo.team1.name + "</td><td>" + scoresheetInfo.team1.score + "</td><td>"
        + scoresheetInfo.team2.name + "</td><td>" + scoresheetInfo.team2.score + "</td><td>" + round + "</td>";
    html += "<td>" + scoresheetInfo.moderator + "</td><td>" + scoresheetInfo.packet + "</td></tr>";
    html += "</tbody></table>";
    // End metadata table
    // Start player tables
    html += "<table style='width:40%;display:inline-table;margin:50px'><tbody>";
    html += "<tr><td class='header'>" + scoresheetInfo.team1.name + "</td>";
    for (var i = 0; i < pointScheme.length; i++) {
        html += "<td class='header'>" + pointScheme[i] + "</td>";
    }
    html += "<td class='header'>TUH</td></tr>";
    for (var i = 0; i < scoresheetInfo.team1.players.length; i++) {
        var player = scoresheetInfo.team1.players[i];
        html += "<tr><td>" + player.name + "</td>";
        for (var j = 0; j < pointScheme.length; j++) {
            html += "<td>" + player.pointTotals[pointScheme[j]] + "</td>";
        }
        html += "<td>" + player.tuh + "</td>";
        html += "</tr>";
    }
    html += "</tbody></table>";
    html += "<table style='width:40%;display:inline-table;margin:50px'><tbody>";
    html += "<tr><td class='header'>" + scoresheetInfo.team2.name + "</td>";
    for (var i = 0; i < pointScheme.length; i++) {
        html += "<td class='header'>" + pointScheme[i] + "</td>";
    }
    html += "<td class='header'>TUH</td></tr>";
    for (var i = 0; i < scoresheetInfo.team2.players.length; i++) {
        var player = scoresheetInfo.team2.players[i];
        html += "<tr><td>" + player.name + "</td>";
        for (var j = 0; j < pointScheme.length; j++) {
            html += "<td>" + player.pointTotals[pointScheme[j]] + "</td>";
        }
        html += "<td>" + player.tuh + "</td>";
        html += "</tr>";
    }
    html += "</tbody></table>";
    // End player tables
    // Start Questions Table
    html += "<table style='margin-top:50px'><tbody><tr><td class='header' style='text-align:center'>#</td>" +
        "<td class='header'>Tossup Answers</td><td class='header'>Bonus</td></tr>";
    for (var i = 0; i < scoresheetInfo.questions.length; i++) {
        var question = scoresheetInfo.questions[i];
        html += "<tr>";
        html += "<td style='text-align:center'>" + question.question_number + "</td>";
        html += "<td><ul>";
        for (var j = 0; j < question.tossup.answers.length; j++) {
            var answer = question.tossup.answers[j];
            var listHTML = "<li style='display:inline;list-style-type:none;float:left;padding:15px;'><strong>Answer " + (j + 1) + "</strong>";
            listHTML += "<ul>";
            listHTML += "<li>Player: " + answer.player + "</li>";
            listHTML += "<li>Team: " + answer.team + "</li>";
            listHTML += "<li>Value: " + answer.value + "</li>";
            listHTML += "</ul></li>";
            html += listHTML;
        }
        html += "</ul></td>";
        html += "<td><ul>";
        for (var j = 0; j < question.bonus.bonusParts.length; j++) {
            var bonusPart = question.bonus.bonusParts[j];
            var listHTML = "<li style='display:inline;list-style-type:none;float:left;padding:15px;'><strong>Part " + (j + 1) + "</strong>";
            listHTML += "<ul>";
            listHTML += "<li>Getting Team: " + bonusPart.gettingTeam + "</li>";
            listHTML += "<li>Value: " + bonusPart.value + "</li>";
            listHTML += "</ul></li>";
            html += listHTML;
        }
        html += "</ul></td>";
        html += "</tr>";
    }
    html += "</tbody></table>";
    html += "</body></html>";
    return html;
}

function downloadScoresheets(anchor) {
    $.ajax({
        url : $(anchor).attr("href"),
        type : "GET",
        success : function(rounds, status, xhr) {
            var zip = new JSZip();
            var pointScheme = Object.keys(rounds.pointScheme);
            for (var roundNumber in rounds.scoresheets) {
                if (rounds.scoresheets.hasOwnProperty(roundNumber)) {
                    var folder = zip.folder("round_" + roundNumber);
                    var scoresheets = rounds.scoresheets[roundNumber];

                    for (var i = 0; i < scoresheets.length; i++) {
                        var filename = "round_" + roundNumber + "_sc_" + (i + 1) + "_" + scoresheets[i].gameTitle + ".html";
                        var json = {
                            team1 : scoresheets[i].team1,
                            team2 : scoresheets[i].team2,
                            round : scoresheets[i].round,
                            moderator : scoresheets[i].moderator ? scoresheets[i].moderator : "-",
                            packet : scoresheets[i].packet ? scoresheets[i].packet : "-",
                            notes : scoresheets[i].notes ? scoresheets[i].notes : "-",
                            questions : scoresheets[i].questions
                        };
                        folder.file(filename, rebuildScoresheet(roundNumber, json, pointScheme));
                    }
                }
            }
            var content = zip.generate({type : "blob"});
            saveAs(content, $(anchor).attr("data-link"));
        }
    });
}

function downloadStats(anchor) {
    $.ajax({
        url : $(anchor).attr("href"),
        type : "GET",
        success : function(databack, status, xhr) {
            if (window.navigator.msSaveOrOpenBlob) {
                var fileData = [databack];
                var blobObject = new Blob(fileData);
                $(anchor).click(function() {
                    window.navigator.msSaveOrOpenBlob(blobObject, $(anchor).attr("data-link"));
                });
            } else {
                var type = xhr.getResponseHeader('Content-Type');
                var blob = new Blob([databack], { type: type });
                var URL = window.URL || window.webkitURL;
                var downloadUrl = URL.createObjectURL(blob);
                var tempAnchor = document.createElement("a");
                   // safari doesn't support this yet
                   if (typeof tempAnchor.download === 'undefined') {
                       window.location = downloadUrl;
                   } else {
                       tempAnchor.href = downloadUrl;
                       tempAnchor.download = $(anchor).attr("data-link");
                       document.body.appendChild(tempAnchor);
                       tempAnchor.click();
                       setTimeout(function() {
                           document.body.removeChild(tempAnchor);
                           window.URL.revokeObjectURL(downloadUrl);
                       }, 100);
                   }
            }
        }
    });
}

function downloadJSON(anchor) {
    $.ajax({
        url : $(anchor).attr("href"),
        type : "GET",
        success : function(databack, status, xhr) {
            // console.log(xhr.getResponseHeader("Content-Type"));
            if (window.navigator.msSaveOrOpenBlob) {
                var fileData = [JSON.stringify(databack, null, 4)];
                var blobObject = new Blob(fileData);
                $(anchor).click(function() {
                    window.navigator.msSaveOrOpenBlob(blobObject, $(anchor).attr("data-link"));
                });
            } else {
                var type = xhr.getResponseHeader('Content-Type');
                var blob = new Blob([JSON.stringify(databack, null, 4)], { type: type });
                var URL = window.URL || window.webkitURL;
                var downloadUrl = URL.createObjectURL(blob);
                var tempAnchor = document.createElement("a");
                   // safari doesn't support this yet
                   if (typeof tempAnchor.download === 'undefined') {
                       window.location = downloadUrl;
                   } else {
                       tempAnchor.href = downloadUrl;
                       tempAnchor.download = $(anchor).attr("data-link");
                       document.body.appendChild(tempAnchor);
                       tempAnchor.click();
                       setTimeout(function() {
                           document.body.removeChild(tempAnchor);
                           window.URL.revokeObjectURL(downloadUrl);
                       }, 100);
                   }
            }
        }
    });
}

function downloadSQBS(anchor) {
    $.ajax({
        url : $(anchor).attr("href"),
        type : "GET",
        success : function(databack, status, xhr) {
            if (window.navigator.msSaveOrOpenBlob) {
                var fileData = [databack];
                var blobObject = new Blob(fileData);
                $(anchor).click(function() {
                    window.navigator.msSaveOrOpenBlob(blobObject, $(anchor).attr("data-link"));
                });
            } else {
                var type = xhr.getResponseHeader('Content-Type');
                var blob = new Blob([databack], { type: type });
                var URL = window.URL || window.webkitURL;
                var downloadUrl = URL.createObjectURL(blob);
                var tempAnchor = document.createElement("a");
                   // safari doesn't support this yet
                   if (typeof tempAnchor.download === 'undefined') {
                       window.location = downloadUrl;
                   } else {
                       tempAnchor.href = downloadUrl;
                       tempAnchor.download = $(anchor).attr("data-link");
                       document.body.appendChild(tempAnchor);
                       tempAnchor.click();
                       setTimeout(function() {
                           document.body.removeChild(tempAnchor);
                           window.URL.revokeObjectURL(downloadUrl);
                       }, 100);
                   }
            }
        }
    });
}

function makePhaseAJAX(tournamentid, phaseName) {
    $("#new-phase").prop("disabled", true);
    $.ajax({
        url : "/tournaments/newphase",
        type : "POST",
        data : {tournamentid : tournamentid, phaseName : phaseName},
        success : function(databack, status, xhr) {
            $("#new-phase").text("New phase created!");
            var html = "<a class='btn btn-lg btn-warning' href='/t/" + databack.newID + "'>Go to Next Phase</a>";
            $(html).hide().appendTo("#success-phase-div").fadeIn(300);
        },
        error : function(xhr, status, err) {
            $("#new-phase").text("Could not make new phase.");
        }
    });
}

function sendTeamToServer() {
    $("#addteammsg").empty().
        append("<p style='margin-left:10px; margin-right:10px; font-size:16px;color:black'>Editing<i class='fa fa-spinner fa-spin' style='margin-left:10px'></i></p>");
    $("#teamform :input").each(function() {
        $(this).val(escapeHtml($(this).val()));
    });
    $.ajax({
        url : "/tournaments/createteam",
        type : "POST",
        data : $("#teamform").serialize(),
        success : function(databack, status, xhr) {
            if (databack["teams"] && databack["newTeam"]) {
                updateTeamSelectionList(databack["teams"]);
                updateTeamList(databack["newTeam"]);
                document.getElementById("teamform").reset();
                showMessageInDiv("#addteammsg", "Successfully added team", null);
            }
        },
        error : function(xhr, status, err) {
            if (err == "Unauthorized") {
                showMessageInDiv("#addteammsg", "Please log in!", err);
            } else {
                showMessageInDiv("#addteammsg", "Could not add team!", err);
            }
        },
        complete : function(xhr, status) {
            $("#add-team-button").prop("disabled", false);
        }
    });
}

function sendGameToServer() {
    $.ajax({
        url : "/tournaments/creategame",
        type : "POST",
        data : $("#gamedataform").serialize(),
        success : function(databack, status, xhr) {
            // console.log(databack);
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
    $("#playersform :input").each(function() {
        $(this).val(escapeHtml($(this).val()));
    });
    $.ajax({
        url : "/tournaments/createplayers",
        type : "POST",
        data : $("#playersform").serialize(),
        success : function(databack, status, xhr) {

        }
    });
}

function findPlayersByTeamnameAndTournament(side) {
    if (side == "LEFT") {
        $.ajax({
            url : "/tournaments/getplayers",
            type : "GET",
            data : {tournamentid : $("#tournament_id_change").val(),
                    teamname : $("#leftchoice").val()},
            success : function(databack, status, xhr) {
                // console.log(databack);
                generatePlayerRows(databack.players, databack.pointScheme, "LEFT");
            }
        });
    } else {
        $.ajax({
            url : "/tournaments/getplayers",
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
        url : "/tournaments/games/remove",
        type : "POST",
        data : forminfo,
        success : function(databack, status, xhr) {
            // console.log("Success : " + databack);
            $(button).parent().parent().parent().remove();
        }
    });
}

function removeTeam(forminfo, button) {
    $(button).text("Deleting team...");
    $.ajax({
        url : "/tournaments/teams/remove",
        type : "POST",
        data : forminfo,
        success : function(databack, status, xhr) {
            $(button).parents("tr").prev().remove();
            $(button).parents("tr").remove();
            var teamid = databack.teamid;
            if (teamid) {
                $("#leftchoice option[value='" + teamid + "']").remove();
                $("#rightchoice option[value='" + teamid + "']").remove();
            }
        },
        error : function(xhr, status, err) {
            $(button).text("Couldn't delete team.");
        }
    });
}

function changePointSchemeAJAX(pointTypes) {
    $("#pointdivmsg").empty().
        append("<p style='margin-left:10px; margin-right:10px;color:black;font-size:16px;'>Working...<i class='fa fa-spinner fa-spin' style='margin-left:10px'></i></p>");
    $.ajax({
        url : "/tournaments/editPointSchema",
        type : "POST",
        data : $("#point-schema-form").serialize(),
        success : function(databack, status, xhr) {
            showMessageInDiv("#pointdivmsg", "Updated point scheme successfully", null);
        },
        error : function(xhr, status, err) {
            showMessageInDiv("#pointdivmsg", "Could not update point scheme", err);
        }
    });
}

function changeDivisionsAJAX() {
    $("#divisions-form :input").each(function() {
        $(this).val(escapeHtml($(this).val()));
    });
    $("#pointdivmsg").empty().
        append("<p style='margin-left:10px; margin-right:10px; color:black;font-size:16px;'>Working...<i class='fa fa-spinner fa-spin' style='margin-left:10px'></i></p>");
    $.ajax({
        url : "/tournaments/editDivisions",
        type : "POST",
        data : $("#divisions-form").serialize(),
        success : function(databack, status, xhr) {
            setSelectOptions("#divisions-list", databack.divisions, "No Divisions");
            showMessageInDiv("#pointdivmsg", "Updated divisions successfully", null);
        },
        error : function(xhr, status, err) {
            showMessageInDiv("#pointdivmsg", "Could not update divisions", err);
        }
    });
}

function editTournamentAJAX() {
    $("#tournament-overview-form :input").each(function() {
        $(this).val(escapeHtml($(this).val()));
    });
    $("#tournament-update-msgdiv").empty().
        append("<p style='margin-left:10px; margin-right:10px; color:black;font-size:16px;'>Editing<i class='fa fa-spinner fa-spin' style='margin-left:10px'></i></p>");
    $.ajax({
        url : "/tournaments/edit",
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
    $("#filterstatsform :input").each(function() {
        $(this).val(escapeHtml($(this).val()));
    });
    $.ajax({
        url : postURL,
        type : "POST",
        data : $("#filterstatsform").serialize(),
        success : function(databack, status, xhr) {
            if (databack.type == "team") {
                displayTeamCustomStats(databack);
            } else if (databack.type == "player") {
                // console.log(databack);
            }
        }
    });
}

function findDirectorsAJAX() {
    $("#searchcollabform :input").each(function() {
        $(this).val(escapeHtml($(this).val()));
    });
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
            }
        }
    });
}

function setSelectOptions(select, options, zeroMessage) {
    var select = $(select);
    select.empty();
    $.each(options, function(index, value) {
        select.append($("<option/>", {
            value: value,
            text: value
        }));
    });
}

function showMessageInDiv(div, message, err) {
    message = escapeHtml(message);
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
    $(button).parent().remove();
}

function addCollaboratorBox(collaborator) {
    var html = "";
    if (collaborator.admin) {
        html += "<div class='col-md-3 collab-box admin' style='padding:20px;font-size:18px;border-radius:2px'>";
    } else {
        html += "<div class='col-md-3 collab-box not-admin' style='padding:20px;font-size:18px;border-radius:2px'>";
    }
    html += "<h3>Name : " + collaborator.name + "</h3>";
    html += "<h3>Email : " + collaborator.email + "</h3>";
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
    var html = "<table class='table table-condensed'><thead><tr>";
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
        html += "<td> <input class='form-control gp-box' type='number' value='1' name='" + "player" + playerNum + sideText + "gp'" + "/> </td>";
        for (var j = 0; j < points.length; j++) {
            var keyNameStr = "name='player" + playerNum + sideText + "_" + points[j] + "val' ";
            var keyId = "id='player" + playerNum + "_" + points[j] + sideText + "id' ";
            var json = JSON.stringify(pointScheme);
            var onkeyupString = "onkeyup=";
            onkeyupString += "'updatePoints(";
            onkeyupString += playerNum + ',' + json + ', "' + sideText + '"' + ")' ";
            var onchangeString = "onchange=";
            onchangeString += "'updatePoints(" + playerNum + ',' + json + ', "' + sideText + '"' + ")'";
            html += "<td><input class='form-control point-box' type='number' " + keyNameStr + keyId + onkeyupString + onchangeString + "/></td>";
        }
        var idTag = "id='" + playerNum + sideText + "pts'";
        html += "<td> <input " + idTag + "class='form-control point-box-disabled disabledview' type='input' placeholder='0' disabled /> </td>";
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
    html += "<a class='btn btn-sm btn-info editbutton' href='/t/" + $("#tournamentshortid").val() + "/games/" + game.shortID + "'> Details </a>";
    html += "<button type='button' class='btn btn-sm btn-warning deletebutton' onclick='removeGameSender(this)'> Remove Game </button>";
    html += "</form> </td>";
    html += "</tr>";
    $(html).hide().appendTo("#gametablebody").fadeIn(300);
    gameList = new List("gamediv", gameOptions);
}

function updateTeamList(team) {
    console.log(team);
    var html = "<tr>";
    html += "<td class='teamname'>" + team.team_name + "</td>";
    html += "<td class='division'>" + team.division + "</td>";
    html += "<td><a class='btn btn-sm btn-info' href='/t/" + $("#tournamentshortid").val() + "/teams/" + team.shortID + "'>Details</a>";
    html += "<button type='button' class='btn btn-warning start-delete-team'><i class='glyphicon glyphicon-remove'></i></button></td></tr>";
    html += "<tr style='display:none'><td></td><td></td><td>";
    html += "<div class='col-md-3 col-lg-3 col-sm-3'><button class='btn btn-stats btn-sm btn-block cancel-delete-team'>Never Mind</button></div>";
    html += "<div class='col-md-3 col-lg-3 col-sm-3'>";
    html += "<form><input type='hidden' name='teamid_form' value='" + team.shortID + "'/>";
    html += "<input type='hidden' name='tournament_idteam' value='" + $("#tournament_id_change").val() + "'/>";
    html += "<button type='button' class='btn btn-sm btn-danger btn-block deleteteambutton'>Confirm</button></form></div></td></tr>";
    $(html).hide().appendTo("#teamtablebody").fadeIn(0);
    $("#teamtablebody tr").last().fadeOut(0);
}

function addPointSchemaRow() {
    var arr = ["B", "N", "P"];
    var html = "<div class='row'><div class='form-group col-md-3'><input type='number' style='width:100%' class='form-control pointval input-medium no-border-radius'/></div>";
    html += "<div class='col-md-9'>";
    for (var i = 0; i < arr.length; i++) {
        if (arr[i] == "P") {
            html += "<label class='radio-inline btn-sm btn-success'>Power<input type='checkbox' value='" + arr[i] + "' class='pointgroup' style='margin-left:5px' onclick='uncheckBoxes(this)'/></label>";
        } else if (arr[i] == "N") {
            html += "<label class='radio-inline btn-sm btn-danger'>Neg<input type='checkbox' value='" + arr[i] + "' class='pointgroup' style='margin-left:5px' onclick='uncheckBoxes(this)'/></label>";
        } else {
            html += "<label class='radio-inline btn-sm btn-info'>Base<input checked type='checkbox' value='" + arr[i] + "' class='pointgroup' style='margin-left:5px' onclick='uncheckBoxes(this)'/></label>";
        }
    }
    html += "<br><br>";
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
            // console.log($(this).val());
            $(this).parent().next().find(".pointgroup").each(function(index, radio) {
                if ($(radio).is(":checked")) {
                    pointTypes[pointValue] = $(radio).val();
                }
            });
        }
    });
    return pointTypes;
}

function formatDivisionsForm() {
    var currentDivisonNum = 1;
    $("#divisions-form :input").each(function() {
        if ($(this).attr("name") !== "tournamentid") {
            $(this).attr("name", "division" + currentDivisonNum);
            // console.log($(this).val() + ", " + $(this).attr("name"));
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

function escapeHtml(string) {
    return String(string).replace(/[&<>"'\/]/g, function (s) {
         return entityMap[s];
    });
}
