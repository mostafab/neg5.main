'use strict';

(function ($) {

    var entityMap = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': '&quot;',
        "'": '&#39;',
        "/": '&#x2F;'
    };

    function escapeHtml(string) {
        return String(string).replace(/[&<>"'\/]/g, function (s) {
            return entityMap[s];
        });
    }

    $(document).ready(function () {

        $("body").on("click", "#entergamebutton-edit", function () {
            var wrong = false;
            $(".point-box-edit").each(function () {
                $(this).removeClass("alert-danger");
                if ($(this).val()) {
                    var val = parseFloat($(this).val());
                    if (val < 0 || Math.floor(val) - val !== 0) {
                        wrong = true;
                        $(this).addClass("alert-danger");
                    }
                }
            });
            $(".gp-box-edit").each(function () {
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
            $(".scorebox-edit").each(function () {
                $(this).removeClass("alert-danger");
                if (!$(this).val()) {
                    wrong = true;
                    $(this).addClass("alert-danger");
                }
            });
            $(".teamselect-edit").removeClass("alert-danger");
            if ($("#leftchoice-edit").val() === $("#rightchoice-edit").val()) {
                wrong = true;
                $(".teamselect-edit").addClass("alert-danger");
            }
            var gamePhasesEdit = $("#game-phases-edit");
            gamePhasesEdit.removeClass("alert-danger");
            if (!gamePhasesEdit.val()) {
                wrong = true;
                gamePhasesEdit.addClass("alert-danger");
            }
            if (!wrong) {
                editGameAJAX();
            }
        });

        $("body").on("click", "#editteambutton", function () {
            var nameInput = $("#team-name-input");
            nameInput.removeClass("alert-danger");
            if (nameInput.val().trim().length !== 0) {
                $(this).prop("disabled", true);
                $("#team-update-msgdiv").empty().append("<p style='margin:10px; font-size:16px;'>Saving Team <i class='fa fa-spinner fa-spin'></i></p>");
                editTeamAJAX();
            } else {
                nameInput.addClass("alert-danger");
            }
        });

        // $("body").on("click", ".saveplayerbutton", function() {
        //     var form = $(this).parent().prev().children("form");
        //     $(this).prop("disabled", true);
        //     editPlayerAJAX($(form).serialize(), $(this));
        // });

        $("body").on("click", ".player-name-box", function () {
            $(this).prop("readonly", false);
        });

        $("body").on("blur", ".player-name-box", function () {
            $(this).prop("readonly", true);
            var form = $(this).parent().serialize();
            editPlayerAJAX(form);
        });

        $("body").on("click", ".deleteplayerbutton", function () {
            var form = $(this).parent().prev().children("form");
            $(this).prop("disabled", true);
            showBeforeSentMessage("Removing Player");
            removePlayerAJAX($(form).serialize(), $(this));
        });

        $("body").on("change", ".teamselect-edit", function () {
            if ($(this).attr("id") == "leftchoice-edit") {
                getTeamPlayersAJAX("LEFT");
            } else {
                getTeamPlayersAJAX("RIGHT");
            }
        });

        $("body").on("keyup", "#newplayerinput", function (e) {
            if (e.which === 13 && $(this).val().trim().length !== 0) {
                e.preventDefault();
                $("#add-player-button").click();
            }
        });

        $("body").on("blur", ".gp-box-edit", function () {
            if (!$(this).val()) {
                $(this).val(0);
            }
        });

        $("body").on("click", "#add-player-button", function () {
            if ($("#newplayerinput").val().trim().length == 0) {
                showMessageInDiv("#player-add-msg", "Enter a name, please", "zero");
            } else {
                var form = $(this).parent().serialize();
                $(this).prop("disabled", true);
                $("#player-add-msg").empty().append("<p style='margin:10px; font-size:16px;'>Adding Player <i class='fa fa-spinner fa-spin'></i></p>");
                addPlayerAJAX(form, $(this));
            }
        });
    });

    function savePlayerSender(button) {
        var form = $(button).parent().prev().children("form");
        $(button).prop("disabled", true);
        editPlayerAJAX($(form).serialize());
    }

    function deletePlayerSender(button) {
        var form = $(button).parent().prev().children("form");
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
        $(html).hide().appendTo(div).fadeIn(200);
    }

    function editGameAJAX() {
        console.log("Ok, editing game");
        $("#updategamediv").empty().append("<p style='margin-left:10px; font-size:16px;color:black;'>Updating Game <i class='fa fa-spinner fa-spin'></i></p>");
        $.ajax({
            url: "/tournaments/games/edit",
            type: "POST",
            data: $("#changegameform-edit").serialize(),
            success: function success(databack, status, xhr) {
                showMessageInDiv("#updategamediv", "Game updated successfully", null);
            },
            error: function error(xhr, status, err) {
                if (err == "Unauthorized") {
                    showMessageInDiv("#updategamediv", "Hmm, doesn't seem like you're logged in", err);
                } else {
                    showMessageInDiv("#updategamediv", "Couldn't connnect to the server!", err);
                }
            }
        });
    }

    function editTeamAJAX() {
        $("#teamdetailsform :input").each(function () {
            $(this).val(escapeHtml($(this).val()));
        });
        var tid = $("#tournament-id-team").val();
        var teamInfo = {
            teamName: $("#team-name-input").val(),
            teamID: $("#team-id").val(),
            divisions: {}
        };
        $(".edit-team-division").each(function () {
            var phaseID = $(this).attr('data-phase-id');
            teamInfo.divisions[phaseID] = $(this).val();
        });
        $.ajax({
            url: "/tournaments/teams/edit",
            type: "POST",
            data: { teamInfo: teamInfo, tid: tid },
            success: function success(databack, status, xhr) {
                if (databack.team) {
                    $("#team-name-header").text(databack.team);
                    showMessageInDiv("#team-update-msgdiv", "Success!", null);
                } else {
                    showMessageInDiv("#team-update-msgdiv", "A team with that name already exists!", "exists");
                }
            },
            error: function error(xhr, status, err) {
                if (err == "Unauthorized") {
                    showMessageInDiv("#team-update-msgdiv", "Doesn't look like you're logged in", err);
                } else {
                    showMessageInDiv("#team-update-msgdiv", "Couldn't update team!", err);
                }
            },
            complete: function complete(databack) {
                $("#editteambutton").prop("disabled", false);
            }
        });
    }

    function editPlayerAJAX(playerForm) {
        showBeforeSentMessage("Saving Player");
        $.ajax({
            url: "/tournaments/players/edit",
            type: "POST",
            data: playerForm,
            success: function success(databack, status, xhr) {
                showAfterSentMessage(databack.msg, databack.err);
            },
            error: function error(xhr, status, err) {
                if (err == "Unauthorized") {
                    showMessageInDiv("#player-add-msg", "Not logged in", err);
                } else {
                    showMessageInDiv("#player-add-msg", "Could not update player", err);
                }
            }
        });
    }

    function addPlayerAJAX(playerForm) {
        $.ajax({
            url: "/tournaments/players/create",
            type: "POST",
            data: playerForm,
            success: function success(databack, status, xhr) {
                showAddPlayerMsg(databack);
                if (!databack.err) {
                    addNewPlayerRow(databack.player, databack.tid);
                }
            },
            error: function error(xhr, status, err) {
                if (err == "Unauthorized") {
                    showMessageInDiv("#player-add-msg", "Doesn't look like you're logged in", err);
                } else {
                    showMessageInDiv("#player-add-msg", "Couldn't add player", err);
                }
            },
            complete: function complete(data) {
                $("#add-player-button").prop("disabled", false);
            }
        });
    }

    function removePlayerAJAX(playerForm, button) {
        showBeforeSentMessage("Removing Player");
        $.ajax({
            url: "/tournaments/players/remove",
            type: "POST",
            data: playerForm,
            success: function success(databack, status, xhr) {
                if (databack.err) {
                    console.log(databack.err);
                } else {
                    $(button).parent().parent().remove();
                }
                showAfterSentMessage(databack.msg, databack.err);
            },
            complete: function complete(databack) {
                $(button).prop("disabled", false);
            }
        });
    }

    function getTeamPlayersAJAX(side) {
        if (side == "LEFT") {
            $.ajax({
                url: "/tournaments/getplayers",
                type: "GET",
                data: { tournamentid: $("#tournament_id_change").val(),
                    teamname: $("#leftchoice-edit").val() },
                success: function success(databack, status, xhr) {
                    replacePlayerRows(databack.players, databack.pointScheme, "LEFT");
                }
            });
        } else {
            $.ajax({
                url: "/tournaments/getplayers",
                type: "GET",
                data: { tournamentid: $("#tournament_id_change").val(),
                    teamname: $("#rightchoice").val() },
                success: function success(databack, status, xhr) {
                    replacePlayerRows(databack.players, databack.pointScheme, "RIGHT");
                }
            });
        }
    }

    function showTeamUpdateMsg(databack) {
        if (databack.err || !databack.team) {
            $("#team-update-msgdiv").empty();
            $("<p style='margin:10px; font-size:16px; color:#ff3300'>" + databack.msg + "<i style='margin-left:5px' class='fa fa-times-circle'></i></p>").hide().appendTo("#team-update-msgdiv").fadeIn(300);
        } else {
            $("#team-update-msgdiv").empty();
            $("<p style='margin:10px; font-size:16px; color:#009933'>" + databack.msg + "<i style='margin-left:5px' class='fa fa-check-circle'></i></p>").hide().appendTo("#team-update-msgdiv").fadeIn(300);
        }
    }

    function showAddPlayerMsg(databack) {
        if (databack.err) {
            $("#player-add-msg").empty();
            $("<p style='margin:10px; font-size:16px; color:#ff3300'>" + databack.msg + "<i style='margin-left:5px' class='fa fa-times-circle'></i></p>").hide().appendTo("#player-add-msg").fadeIn(300);
        } else {
            $("#player-add-msg").empty();
            $("<p style='margin:10px; font-size:16px; color:#009933'>" + databack.msg + "<i style='margin-left:5px' class='fa fa-check-circle'></i></p>").hide().appendTo("#player-add-msg").fadeIn(300);
        }
    }

    function addNewPlayerRow(player, tid) {
        var html = "<tr>";
        html += "<td><form name='editplayerform'>";
        html += "<input type='hidden' name='tournamentidform' value='" + tid + "'/>";
        html += "<input type='hidden' name='playerid' value='" + player._id + "'>";
        html += "<input type='text' class='form-control nf-input player-name-box saved' name='playername' value='" + player.player_name + "'/>";
        html += "</form></td>";
        html += "<td>";
        html += "<button type='button' class='btn btn-sm nf-red deleteplayerbutton' onclick='deletePlayerSender(this)'><i class='fa fa-trash'></i></button>";
        html += "</td></tr>";
        $(html).hide().appendTo("#playersbody").fadeIn(300);
    }

    function replacePlayerRows(players, pointScheme, side) {
        var choice = side == "LEFT" ? "#left-text-edit" : "#right-text-edit";
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
            html += "<input type='hidden' value='" + players[i]._id + "' " + "name='" + "player" + playerNum + sideText + "id'" + "/>";
            html += "<td>" + players[i].player_name + "</td>";
            html += "<td> <input class='form-control nf-input' type='number'" + "value='0' name='" + "player" + playerNum + sideText + "gp'" + "/> </td>";
            for (var j = 0; j < points.length; j++) {
                var keyNameStr = "name='player" + playerNum + sideText + "_" + points[j] + "val' ";
                var keyId = "id='player" + playerNum + "_" + points[j] + sideText + "id' ";
                var json = JSON.stringify(pointScheme);
                var onkeyupString = "onkeyup=";
                onkeyupString += "'updatePoints(";
                onkeyupString += playerNum + ',' + json + ', "' + sideText + '"' + ")' ";
                var onchangeString = "onchange=";
                onchangeString += "'updatePoints(" + playerNum + ',' + json + ', "' + sideText + '"' + ")'";
                html += "<td><input class='form-control nf-input' type='number' " + keyNameStr + keyId + onkeyupString + onchangeString + "/></td>";
            }
            var idTag = "id='" + playerNum + sideText + "pts'";
            html += "<td> <input " + idTag + "class='form-control nf-input disabledview' type='input' placeholder='0' disabled /> </td>";
            html += "</tr>";
            playerNum++;
        }
        html += "</tbody><tfoot><tr></tr></tfoot></table>";
        $(choice).append(html);
    }

    function showAfterSentMessage(message, err) {
        $("#player-add-msg").empty();
        if (err) {
            $("<p style='margin:10px; font-size:16px; color:#ff3300'>" + message + "<i style='margin-left:5px' class='fa fa-times-circle'></i></p>").hide().appendTo("#player-add-msg").fadeIn(300);
        } else {
            $("<p style='margin:10px; font-size:16px; color:#009933'>" + message + "<i style='margin-left:5px' class='fa fa-check-circle'></i></p>").hide().appendTo("#player-add-msg").fadeIn(300);
        }
    }

    function showBeforeSentMessage(message) {
        $("#player-add-msg").empty().append("<p style='margin:10px; font-size:16px;color:black'>" + message + "<i class='fa fa-spinner fa-spin'></i></p>");
    }
})(jQuery);