(function($, global) {

    let nextPlayerNum = 5;
    let gameOptions;
    let teamOptions;
    let playerOptions;
    let gameList;
    let teamList;
    let playerList;

    const entityMap = {
       "&": "&amp;",
       "<": "&lt;",
       ">": "&gt;",
       '"': '&quot;',
       "'": '&#39;',
       "/": '&#x2F;'
     };
     
     let $refs;
     
    $(document).ready(function() {
        
        $refs = {
            $gameElements: {
                $enterGameButton: $('#entergamebutton'),
                $leftTeamSelectId: $("#leftteamnameID"),
                $rightTeamSelectId: $("#rightteamnameID") 
            },
            $teamElements: {
                $teamNameInput: $('#team_name_input'),
                $addTeamButton: $('#add-team-button'),
                $teamSelect: $('.teamselect'),
                $newPlayerButton: $("#newlineplayer")
            },
            $configurationElements: {
                $addPointValueButton: $('#add-point-value-button'),
                $savePointSchemaButton: $('#save-point-schema-button'),
                $saveDivisionsButton: $('#save-divisions-button')
            },
            $tournamentElements: {
                $editTournamentButton: $('#edittournamentbutton')
            },
            $phaseElements: {
                $phaseSelect: $("#phase-select-stats")
            }
        }
        
        let {$gameElements, $teamElements, $configurationElements, 
            $tournamentElements, $phaseElements} = $refs;
        
        gameOptions = { valueNames : ["round", "team1name", "team2name", "team-1-score", "team-2-score", "tuh"]};
        gameList = new List("gamediv", gameOptions);

        teamOptions = { valueNames : ["teamname", "division"]};
        teamList = new List("teamdiv", teamOptions);

        playerOptions = { valueNames : []};

        $gameElements.$enterGameButton.prop("disabled", true);
        $gameElements.$enterGameButton.removeClass("nf-blue").addClass("nf-red");

        $(".collapsable").click(function(e) {
            e.stopImmediatePropagation();
            let collapsable = $(this);
            collapsable.next().toggle(300, function() {
                collapsable.children(".arrow").toggleClass("fa-arrow-up").toggleClass("fa-arrow-down");
            });
        });
        
       $configurationElements.$addPointValueButton.click(function() {
            addPointSchemaRow();
        });

        $("body").on("click", ".remove-phase", function() {
            var pid = $(this).attr("data-phase-id");
            removePhase(pid, $(this));
        });

        $teamElements.$addTeamButton.click(function(e) {
            let $teamNameInput = $teamElements.$teamNameInput;
            $teamNameInput.removeClass('alert-danger');
            if ($teamNameInput.val().length !== 0) {
                let teamInfo = getNewTeamInfo();
                sendTeamToServer(teamInfo);
            } else {
               $teamNameInput.addClass('alert-danger');
            }
        });

        $teamElements.$teamNameInput.keyup(function(e) {
            $(this).removeClass('alert-danger');
            let teamname = $teamElements.$teamNameInput.val().trim();
            $("#player_team_dynamic").val(teamname);
        });

        $teamElements.$newPlayerButton.click(function(e) {
            createPlayerInputField();
        });

        $teamElements.$teamSelect.change(function(e) {
            if ($(this).attr("id") == "leftchoice") {
                findPlayersByTeamnameAndTournament("LEFT");
                $gameElements.$leftTeamSelectId.val($(this).find(":selected").text());
            } else {
                findPlayersByTeamnameAndTournament("RIGHT");
                $gameElements.$rightTeamSelectId.val($(this).find(":selected").text());
            }
            let bothselect = true;
            $teamElements.$teamSelect.each(function() {
                if ($(this).val() === "") {
                    $gameElements.$enterGameButton.prop("disabled", true)
                        .removeClass('nf-blue').addClass('nf-red');
                    bothselect = false;
                }
            });
            if (bothselect) {
                $gameElements.$enterGameButton.prop("disabled", false)
                    .removeClass("nf-red").addClass("nf-blue");
            }
        });

        $gameElements.$enterGameButton.click(function(e) {
            let wrong = false;
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
            $gameElements.$teamSelect.removeClass("alert-danger");
            if ($("#leftchoice").val() === $("#rightchoice").val()) {
                wrong = true;
                $gameElements.$teamSelect.addClass("alert-danger");
            }
            var gamePhases = $("#game-phases");
            gamePhases.removeClass("alert-danger");
            if (!gamePhases.val()) {
                wrong = true;
                gamePhases.addClass("alert-danger");
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

        $("body").on("click", ".deletebutton", function(e) {
            e.stopPropagation();
            removeGame($(this).parent().serialize(), $(this));
        });

        $("body").on("click", ".start-delete-team", function(e) {
            e.stopPropagation();
            $(this).parents("tr").next().slideDown(0);
        });

        $("body").on("click", ".cancel-delete-team", function() {
            $(this).parents("tr").slideUp(0);
        });

        $("body").on("click", ".deleteteambutton", function() {
            removeTeam($(this).parent().serialize(), $(this));
        });

        $("body").on("click", ".add-division", function() {
            addDivisionRow($(this).attr("data-phase-id"));
        });

        $("body").on("click", ".team-anchor", function(e) {
            e.preventDefault();
            var td = $(this).children("td").first();
            loadTeamAJAX($(this).attr("data-href"), td);
        });

        $("body").on("click", ".pointval", function() {
            $(this).prop("readonly", false);
        });

        $("body").on("blur", ".pointval", function() {
            if ($(this).val().trim().length > 0) {
                $(this).prop("readonly", true);
            }
            if ($(this).attr("data-last-name") != $(this).val().trim()) {
                $(this).addClass("not-saved").removeClass("saved");
            } else {
                $(this).addClass("saved").removeClass("not-saved");
            }
        });

        $("body").on("blur", ".gp-box", function() {
            if (!$(this).val()) {
                $(this).val(0);
            }
        });

       $configurationElements.$savePointSchemaButton.click(function(e) {
            let pointTypes = formatPointTypes();
            formatPointSchemaForm(pointTypes);
            changePointSchemeAJAX(pointTypes);
        });

       $configurationElements.$saveDivisionsButton.click(function(e) {
            let divisions = [];
            $(".division-name").each(function() {
                let name = $(this).val().trim();
                let phaseID = $(this).attr('data-phase-id');
                if (name.length !== 0) {
                    let division = {phase_id : phaseID, name : name};
                    divisions.push(division);
                }
            });
            changeDivisionsAJAX(divisions, true);
        });

        $tournamentElements.$editTournamentButton.click(function(e) {
            editTournamentAJAX();
        });

        $phaseElements.$phaseSelect.change(function() {
            let phaseID = $(this).val();
            let phaseName = $(this).find(":selected").text().replace(/\s/g, "_").toLowerCase();
            $(".stat-link").each(function() {
                var tid = $(this).attr("data-tid");
                var statsType = $(this).attr('data-stats-type');
                var url = "/t/" + tid + "/stats/" + statsType + "?phase=" + phaseID;
                $(this).attr("href", url);
            });
            $(".download").each(function() {
                var tid = $(this).attr("data-tid");
                var statsType = $(this).attr('data-stats-type');
                var url = "/t/" + tid + "/stats/" + statsType + "/dl?phase=" + phaseID;
                $(this).attr("href", url);
                $(this).attr("data-phase", phaseName);
            });
        });

        $(".custombutton").click(function(e) {
            var postURL = $(this).attr("data-post-url");
            $("#filterstatsform").attr("action", postURL);
            $("#filterstatsform").submit();
        });

        $("#searchcollabbutton").click(function() {
            if ($("#searchcollabinput").val().trim().length >= 5) {
                findDirectorsAJAX();
            }
        });

        $("#addcollabbutton").click(function() {
            if ($("#directorsoptions").val()) {
                addCollaboratorsAJAX();
            }
        });

        $(".removecollab").click(function() {
            removeCollabAJAX(this);
        });

        $("body").on("click", ".division-name", function() {
            $(this).prop("readonly", false).addClass("not-saved").removeClass("saved");
        });

        $("body").on("blur", ".division-name", function() {
            if ($(this).val().trim().length > 0) {
                $(this).prop("readonly", true);
            }
            if ($(this).attr("data-last-name") !== $(this).val().trim()) {
                $(this).addClass("not-saved").removeClass("saved");
            } else {
                $(this).addClass("saved").removeClass("not-saved");
            }
        });

        $("#playerstatstable th").each(function(index, head) {
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

         $('[data-toggle="tooltip"]').tooltip();


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

        $("#switch-phases").click(function() {
            var newPhase = $("#phase-select").val();
            var tid = $("#tournamentshortid").val();
            switchPhasesAJAX(newPhase, tid);
        });

        $("#new-phase").click(function() {
            $("#new-phase-name").css("border-color", "white");
            if ($("#new-phase-name").val().length !== 0) {
                makePhaseAJAX($(this).attr("data-tournament"), escapeHtml($("#new-phase-name").val()));
            } else {
                $("#new-phase-name").css("border-color", "red");
            }
        });

        $("#delete-tournament-button").click(function() {
            $("#confirm-delete-div").slideDown(300);
        })

        $("#no-delete").click(function() {
            $("#confirm-delete-div").slideUp(300);
        })

        $("#yes-delete").click(function() {
            document.deleteTournament.submit();
        });

        $("#save-phases").click(function() {
            var phases = [];
            var empty = false;
            $(".phase-box").each(function() {
                $(this).removeClass("alert-danger");
                var phaseName = $(this).val().trim();
                if (phaseName.length !== 0) {
                    var phase = {name : phaseName, phase_id : $(this).attr("data-phase-id"), active : $(this).data("active-phase")};
                    phases.push(phase);
                } else {
                    empty = true;
                    $(this).addClass("alert-danger");
                }
            });
            if (!empty) {
                editPhasesAJAX(phases, $(this).attr('data-tid'));
            }
        });

        $("body").on("click", "#refresh-teams", function() {
            console.log("refreshing teams");
            var href = $(this).attr("data-href");
            $.ajax({
                url : href,
                type : "GET",
                success : function(databack, status, xhr) {
                    $("#team-view-div").empty();
                    $("#team-list-template").html(databack);
                    $("#add-team-div").show();
                    $("#team-list-div").show();
                    teamOptions = { valueNames : ["teamname", "division"]};
                    teamList = new List("teamdiv", teamOptions);
                    $("[data-toggle='tooltip']").tooltip();
                }
            });
        });

        $("body").on("click", "#refresh-games", function() {
            console.log("refreshing games");
            var href = $(this).attr("data-href");
            $.ajax({
                url : href,
                type : "GET",
                success : function(databack, status, xhr) {
                    $("#game-view-div").empty();
                    $("#game-list-template").html(databack);
                    $("#add-game-div").show();
                    $("#game-list-div").show();
                    gameOptions = { valueNames : ["round", "team1name", "team2name", "team-1-score", "team-2-score", "tuh"]};
                    gameList = new List("gamediv", gameOptions);
                    $("[data-toggle='tooltip']").tooltip();
                }
            });
        });

        $("body").on("click", "#back-to-teams", function(e) {
            e.preventDefault();
            var button = $(this);
            var href = button.attr("data-href");
            button.text("Loading...");
            $.ajax({
                url : href,
                type : "GET",
                success : function(databack, status, xhr) {
                    $("#team-view-div").empty();
                    $("#team-list-template").html(databack);
                    $("#add-team-div").show();
                    $("#team-list-div").show();
                    teamOptions = { valueNames : ["teamname", "division"]};
                    teamList = new List("teamdiv", teamOptions);
                    $("[data-toggle='tooltip']").tooltip();
                },
                complete : function() {
                    button.text("Teams");
                }
            });
        });

        $("body").on("click", "#back-to-games", function(e) {
            e.preventDefault();
            let button = $(this);
            button.text("Loading");
            let href = button.attr("data-href");
            $.ajax({
                url : href,
                type : "GET"
            })
            .then(response => {
                $(".tournament-navigation-panel").removeClass('hidden-sm');
                $("#game-view-div").empty();
                $("#game-list-template").html(response);
                $("#add-game-div").show();
                $("#game-list-div").show();
                gameOptions = { valueNames : ["round", "team1name", "team2name", "team-1-score", "team-2-score", "tuh"]};
                gameList = new List("gamediv", gameOptions);
                $("[data-toggle='tooltip']").tooltip();
            })
            .always(() => {
                button.text("Games");
            });
        });

        $("body").on("click", ".game-anchor", function(e) {
            e.preventDefault();
            let href = $(this).attr("data-href");
            let td = $(this).children("td").first();
            loadGameAJAX(href, td);
        });

    });

    function getNewTeamInfo() {
        var teamInfo = {};
        teamInfo.divisions = {};
        teamInfo.teamName = $("#team_name_input").val();
        teamInfo.players = [];
        $(".new-team-division").each(function() {
            var phase = $(this).attr("data-phase-id");
            teamInfo.divisions[phase] = $(this).val();
        });
        $(".player-name").each(function() {
            var name = $(this).val().trim();
            if (name.length !== 0) {
                teamInfo.players.push(name);
            }
        });
        return teamInfo;
    }

    function uncheckBoxes(checkbox) {
        var parentDiv = $(checkbox).parent().parent();
        parentDiv.find(".pointgroup").each(function(index, radio) {
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
        return empty;
    }

    function removeTeamSender(button) {
        removeTeam($(button).parent().serialize(), button);
    }

    function removeGameSender(button) {
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

    function loadTeamAJAX(href, td) {
        var html = "<p class='loading'><i class='fa fa-spinner fa-spin' style='margin-left:10px'></i></p>";
        var lastText = td.text();
        td.html(html);
        $.ajax({
            url : href,
            type : 'GET',
            success : function(databack, status, xhr) {
                html = "<p class='loading-complete'><i class='fa fa-check-circle'></i></p>";
                td.html(html);
                $("#add-team-div").slideUp(300);
                $("#team-list-div").slideUp(300);
                $("#team-view-div").slideUp(0).html(databack).slideDown(300);
                $("[data-toggle='tooltip']").tooltip();
            },
            error : function(xhr, status, err) {
                td.html(lastText);
            },
            complete : function() {
                progressBar.removeClass(progressBarClasses);
            }
        });
    }

    function loadGameAJAX(href, td) {
        let html = "<p class='loading'><i class='fa fa-spinner fa-spin' style='margin-left:10px'></i></p>";
        let lastText = td.text();
        td.html(html);
        $.ajax({
            url : href,
            type : 'GET',
            success : function(databack, status, xhr) {
                html = "<p class='loading-complete'><i class='fa fa-check-circle'></i></p>";
                td.html(html);
                $("#add-game-div").slideUp(300);
                $("#game-list-div").slideUp(300);
                $("#game-view-div").slideUp(0).html(databack).slideDown(300);
                $(".tournament-navigation-panel").addClass("hidden-sm");
            },
            error : function(xhr, status, err) {
                td.html(lastText);
            }
        });
    }

    function editPhasesAJAX(phases, tid) {
        $.ajax({
            url : "/tournaments/editphases",
            type : "POST",
            data : {tid : tid, phases : phases},
            success : function(databack, status, xhr) {
                $("#team-list-template").html(databack.teamHTML);
                $("#game-list-template").html(databack.gameHTML);
                for (var i = 0; i < databack.phases.length; i++) {
                    $(".phase-name[data-phase-id='" + databack.phases[i].phase_id + "']").text(databack.phases[i].name);
                }
            }
        });
    }

    function switchPhasesAJAX(newPhase, tid) {
        var button = $("#switch-phases");
        var header = $("#current-phase-header");
        button.prop("disabled", true);
        $.ajax({
            url : "/tournaments/switchphases",
            type : "POST",
            data : {newPhaseID : newPhase, tid : tid},
            success : function(databack, status, xhr) {
                if (databack.switched) {
                    $(".phase-selection").each(function() {
                        $(this).children("option").each(function() {
                            $(this).prop("selected", false);
                            if ($(this).val() == newPhase) {
                                header.text("Current Phase: " + $(this).text());
                                $(this).prop("selected", true);
                            }
                        });
                    });
                    $(".phase-box").each(function() {
                        $(this).parents("tr").removeClass("active-phase");
                        if ($(this).attr('data-phase-id') == newPhase) {
                            $(this).attr('data-active-phase', true);
                            $(this).parents("tr").addClass("active-phase");
                        } else {
                            $(this).attr('data-active-phase', false);
                        }
                    });
                    $("#phase-select-stats").change();
                }
            },
            complete : function() {
                button.prop("disabled", false);
            }
        });
    }

    function removePhase(phaseID, button) {
        button.text("Remove");
        $.ajax({
            url : "/tournaments/removephase",
            type : "POST",
            data : {phaseID : phaseID, tid : $("#tournamentshortid").val()},
            success : function(databack, status, xhr) {
                if (databack.removed) {
                    button.parents("tr").remove();
                } else {
                    button.text("You must have at least one phase. You cannot remove a phase that has games in it.");
                }
            },
            error : function() {
                button.text("Could not remove phase!");
            }
        });
    }

    function downloadScoresheets(anchor) {
        var progressBar = $(".progress-indicator");
        progressBar.addClass(progressBarClasses);
        $.ajax({
            url : $(anchor).attr("href"),
            type : "GET",
            success : function(rounds, status, xhr) {
                progressBar.removeClass(progressBarClasses);
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
        var downloadFileName = $(anchor).attr("data-link") + "_" +
            $(anchor).attr("data-phase") + $(anchor).attr("data-file");
        var progressBar = $(".progress-indicator");
        progressBar.addClass(progressBarClasses);
        $.ajax({
            url : $(anchor).attr("href"),
            type : "GET",
            success : function(databack, status, xhr) {
                progressBar.removeClass(progressBarClasses);
                if (window.navigator.msSaveOrOpenBlob) {
                    var fileData = [databack];
                    var blobObject = new Blob(fileData);
                    $(anchor).click(function() {
                        window.navigator.msSaveOrOpenBlob(blobObject, downloadFileName);
                    });
                } else {
                    var type = xhr.getResponseHeader('Content-Type');
                    var blob = new Blob([databack], { type: type });
                    var URL = window.URL || window.webkitURL;
                    var downloadUrl = URL.createObjectURL(blob);
                    var tempAnchor = document.createElement("a");
                       if (typeof tempAnchor.download === 'undefined') {
                           window.location = downloadUrl;
                       } else {
                           tempAnchor.href = downloadUrl;
                           tempAnchor.download = downloadFileName;
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
        var progressBar = $(".progress-indicator");
        progressBar.addClass(progressBarClasses);
        $.ajax({
            url : $(anchor).attr("href"),
            type : "GET",
            success : function(databack, status, xhr) {
                progressBar.removeClass(progressBarClasses);
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
        $("#new-phase").text("New Phase");
        $.ajax({
            url : "/tournaments/newphase",
            type : "POST",
            data : {tournamentid : tournamentid, phaseName : phaseName},
            success : function(databack, status, xhr) {
                if (databack.newPhase) {
                    var selectHTML = "<option value='" + databack.newPhase.phase_id + "' class='phase-name' data-phase-id='" + databack.newPhase.phase_id + "'>" + databack.newPhase.name + "</option>";
                    $(".phase-selection").each(function() {
                        $(this).append(selectHTML);
                    });
                    var tableHTML = "<tr><td><input type='text' data-phase-id='" + databack.newPhase.phase_id + "'"
                        + "value='" + databack.newPhase.name + "' class='form-control nf-input phase-box input-sm'/></td>";
                    tableHTML += "<td><button data-phase-id='" + databack.newPhase.phase_id + "' class='btn nf-red btn-sm remove-phase'>Remove</button></td></tr>";
                    $("#phases-body").append(tableHTML);
                    $("#new-phase-name").val("");
                } else {
                    $("#new-phase").text("There's already a phase with that name.");
                }
            },
            error : function(xhr, status, err) {
                $("#new-phase").text("Could not make new phase.");
            },
            complete : function() {
                $("#new-phase").prop("disabled", false);
            }
        });
    }

    function sendTeamToServer(teamInfo) {
        $("#addteammsg").empty().
            append("<p style='margin-left:10px; margin-right:10px; font-size:16px;color:black'>Editing<i class='fa fa-spinner fa-spin' style='margin-left:10px'></i></p>");
        $("#teamform :input").each(function() {
            $(this).val(escapeHtml($(this).val()));
        });
        $.ajax({
            url : "/tournaments/createteam",
            type : "POST",
            data : {teamInfo : teamInfo, tid : $("#tournament_id_change").val()},
            success : function(databack, status, xhr) {
                updateTeamSelectionList(databack.teams);
                $("#team-list-template").html(databack.html);
                document.getElementById("teamform").reset();
                showMessageInDiv("#addteammsg", "Successfully added team", null);
                teamOptions = { valueNames : ["teamname", "division"]};
                teamList = new List("teamdiv", teamOptions);
                $("[data-toggle='tooltip']").tooltip();
            },
            error : function(xhr, status, err) {
                if (xhr.status === 401) {
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
                $("#add-game-message").empty();
                $("<p style='margin-left:10px; font-size:16px; color:#009933'>Successfully added game <i class='fa fa-check-circle'></i></p>").
                    hide().appendTo("#add-game-message").fadeIn(300);
                $("#game-list-template").html(databack);
                document.getElementById("gamedataform").reset();
                gameOptions = { valueNames : ["round", "team1name", "team2name", "team-1-score", "team-2-score", "tuh"]};
                gameList = new List("gamediv", gameOptions);
                $("[data-toggle='tooltip']").tooltip();
            },
            error : function() {
                $("<p style='margin-left:10px; font-size:16px; color:#ff3300'>Couldn't add game<i class='fa fa-times-circle'></i></p>").
                    hide().appendTo("#add-game-message").fadeIn(300);
            },
            complete : function() {
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
        $.ajax({
            url : "/tournaments/teams/remove",
            type : "POST",
            data : forminfo,
            success : function(databack, status, xhr) {
                var teamid = databack.teamID;
                if (databack.removed) {
                    $(button).text("Deleting team...");
                    $(".team-tr[data-team-id='" + teamid + "']").each(function() {
                        $(this).remove();
                    });
                    $("#leftchoice option[value='" + teamid + "']").remove();
                    $("#rightchoice option[value='" + teamid + "']").remove();
                    teamOptions = { valueNames : ["teamname", "division"]};
                    teamList = new List("teamdiv", teamOptions);
                } else {
                    $(button).text("This team has games played.");
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
                $(".pointval").each(function() {
                    if ($(this).val().trim().length === 0) {
                        $(this).parents(".point-schema-row").fadeOut(200, function() {
                            $(this).remove();
                        });
                    } else {
                        $(this).removeClass("not-saved").addClass("saved").prop("readonly", true).attr("data-last-name", $(this).val().trim());
                    }
                });
                $(".empty").fadeOut(200, function() {
                    $(this).remove();
                });
            },
            error : function(xhr, status, err) {
                showMessageInDiv("#pointdivmsg", "Could not update point scheme", err);
            }
        });
    }

    function changeDivisionsAJAX(divisions, clearEmpty) {
        $("#pointdivmsg").empty().
            append("<p style='margin-left:10px; margin-right:10px; color:black;font-size:16px;'>Working...<i class='fa fa-spinner fa-spin' style='margin-left:10px'></i></p>");
        $.ajax({
            url : "/tournaments/editDivisions",
            type : "POST",
            data : {divisions : divisions, tid : $("#tid-divisions").val()},
            success : function(databack, status, xhr) {
                setSelectOptions(databack.divisions);
                showMessageInDiv("#pointdivmsg", "Updated divisions successfully", null);
                if (clearEmpty) {
                    $(".division-name").each(function() {
                        if ($(this).val().trim().length === 0) {
                            $(this).addClass("empty");
                        } else {
                            var lastName = $(this).val().trim();
                            $(this).prop("readonly", true).addClass("saved").removeClass('not-saved').attr("data-last-name", lastName);
                        }
                    });
                    $(".empty").fadeOut(200, function() {
                        $(this).remove();
                    });
                }
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

    function setSelectOptions(divisions) {
        $(".new-team-division").empty();
        divisions.forEach(function(division) {
            var id = division.phase_id;
            var html = "<option value='" + division.phase_id + "'>" + division.name + "</option>";
            $(".new-team-division[data-phase-id='" + id + "']").append(html);
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
            html += "<div class='col-md-3 collab-box nf-card nf-white'>";
        } else {
            html += "<div class='col-md-3 collab-box nf-card nf-white'>";
        }
        html += "<p>Name : " + collaborator.name + "</p>";
        html += "<p>Email : " + collaborator.email + "</p>";
        html += "<button class='btn btn-sm nf-red removecollab' style='margin-top:20px' onclick='removeCollabAJAX(this)' data-collabid='"
            + collaborator.id + "'>Remove</button>";
        html += "</div>";
        var div = collaborator.admin ? "#admin-div" : "#non-admin-div";
        $(html).hide().appendTo(div).fadeIn(300);
    }

    function createPlayerInputField() {
        var newInput = "<input type='text'/>";
        var classes = "form-control nf-input input-medium center-text no-border-radius player-name btn-shadow";
        var name = "player" + nextPlayerNum + "_name";
        var placeholder = "Player " + nextPlayerNum;
        var autocomplete = "off";
        $(newInput).attr("class", classes).attr("name", name).attr("placeholder", placeholder)
            .attr("autocomplete", autocomplete).appendTo("#player-dynamic");
        nextPlayerNum++;
    }

    function generatePlayerRows(players, pointScheme, side) {
        var choice = side == "LEFT" ? "#left-text" : "#right-text";
        var points = Object.keys(pointScheme).sort(function(first, second) {
            return parseFloat(second) - parseFloat(first);
        });
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
            html += "<td> <input class='form-control nf-input gp-box btn-shadow input-sm' type='number' value='1' name='" + "player" + playerNum + sideText + "gp'" + "/> </td>";
            for (var j = 0; j < points.length; j++) {
                var keyNameStr = "name='player" + playerNum + sideText + "_" + points[j] + "val' ";
                var keyId = "id='player" + playerNum + "_" + points[j] + sideText + "id' ";
                var json = JSON.stringify(pointScheme);
                var onkeyupString = "onkeyup=";
                onkeyupString += "'updatePoints(";
                onkeyupString += playerNum + ',' + json + ', "' + sideText + '"' + ")' ";
                var onchangeString = "onchange=";
                onchangeString += "'updatePoints(" + playerNum + ',' + json + ', "' + sideText + '"' + ")'";
                html += "<td><input class='form-control nf-input input-sm point-box btn-shadow' type='number' " + keyNameStr + keyId + onkeyupString + onchangeString + "/></td>";
            }
            var idTag = "id='" + playerNum + sideText + "pts'";
            html += "<td> <input " + idTag + "class='input-sm form-control nf-input point-box-disabled disabledview btn-shadow' type='input' placeholder='0' readonly/> </td>";
            html += "</tr>";
            playerNum++;
        }
        html += "</tbody><tfoot><tr></tr></tfoot></table>";
        $(choice).append(html);
    }

    function updatePoints(num, pointvalues, side) {
        var total = 0;
        for (let key in pointvalues) {
            var inputField = "player" + num + "_" + key + side + "id";
            var inputVal = $("#" + inputField).val();
            if (!isNaN(parseInt(inputVal))) {
                total += parseInt(inputVal) * parseInt(key);
            }
        }
        var ptLabelId = "#" + num + side + "pts";
        $(ptLabelId).val(total);
    }
    global.updatePoints = updatePoints;

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

    function addPointSchemaRow() {
        var arr = ["B", "N", "P"];
        var html = "<div class='row point-schema-row'><div class='form-group col-md-3'><input type='number' style='width:100%' class='form-control nf-input pointval not-saved input-medium no-border-radius btn-shadow'/></div>";
        html += "<div class='col-md-9'>";
        for (var i = 0; i < arr.length; i++) {
            if (arr[i] == "P") {
                html += "<label class='radio-inline btn-sm nf-green nf-button'>Power<input type='checkbox' value=" + arr[i] + " class='pointgroup' style='margin-left:5px' onclick='uncheckBoxes(this)'/></label>";
            } else if (arr[i] == "N") {
                html += "<label class='radio-inline btn-sm nf-red nf-button'>Neg<input type='checkbox' value=" + arr[i] + " class='pointgroup' style='margin-left:5px' onclick='uncheckBoxes(this)'/></label>";
            } else {
                html += "<label class='radio-inline btn-sm nf-blue nf-button'>Base<input checked type='checkbox' value=" + arr[i] + " class='pointgroup' style='margin-left:5px' onclick='uncheckBoxes(this)'/></label>";
            }
        }
        html += "</div></div>";
        $(html).hide().appendTo("#point-schema-form").fadeIn(0);
    }

    function addDivisionRow(phase) {
        var html = "<input type='text' data-phase-id='" + phase + "' style='width:100%' class='form-control nf-input input-medium no-border-radius division-name not-saved btn-shadow'/>";
        $(html).hide().appendTo(".division-box[data-phase-id='" + phase + "']").fadeIn(200);
        $(".division-box[data-phase-id='" + phase + "']").children(".division-name").last().focus();
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

})(jQuery, window);
