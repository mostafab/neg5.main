'use strict';

var MAX_TOSSUPS = 20;

class Player {
    constructor(name, id, teamid) {
        this.name = name;
        this.id = id;
        this.teamid = teamid;
    }
}

class Team {
    constructor(name, id) {
        this.id = id;
        this.name = name;
        this.players = [];
    }
}

class Answer {
    constructor(team, player, value) {
        this.team = team;
        this.player = player;
        this.value = value;
    }
}

class Tossup {
    constructor() {
        this.answers = [];
    }

    getAnswers() {
        return this.answers;
    }

    addAnswer(teamid, playerid, value) {
        this.answers.push(new Answer(teamid, playerid, value));
        console.log(this.answers);
    }

    removeLastAnswer() {
        if (this.answers.length != 0) {
            this.answers.pop();
        }
    }
}

class Bonus {
    constructor() {
        this.forTeam = null;
        this.forTeamPoints = 0;
        this.againstTeamPoints = 0;
    }

    setForTeam(teamid) {
        this.forTeam = teamid;
    }

    setForTeamPoints(points) {
        this.forTeamPoints = points;
    }

    setAgainstTeamPoints(points) {
        this.againstTeamPoints = points;
    }

    getForTeam() {
        return this.forTeam;
    }

    getForTeamPoints() {
        return this.forTeamPoints;
    }

    getAgainstTeamPoints() {
        return this.againstTeamPoints;
    }


}

class Phase {
    constructor(number) {
        this.number = number;
        this.tossup = new Tossup();
        this.bonus = new Bonus();
    }

    getNumber() {
        return this.number;
    }

    getTossupPointsEarned(teamid) {
        var sum = 0;
        var answers = this.tossup.getAnswers();
        for (var i = 0; i < answers.length; i++) {
            if (answers[i].player.teamid == teamid) {
                sum += answers[i].value;
            }
        }
        return sum;
    }

    getBonusPointsEarned(teamid) {
        if (this.bonus)
        return pointsEarned;
    }

    getBounceBackPoints(teamid) {
        return 0;
    }

    getTossup() {
        return this.tossup;
    }

    getBonus() {
        return this.bonus;
    }

    addAnswerToTossup(teamid, playerid, value) {
        this.tossup.addAnswer(teamid, playerid, value);
    }

    getBonusPointsForTeam(teamid) {
        if (this.bonus.getForTeam() == teamid) {
            return this.bonus.getForTeamPoints();
        } else {
            return this.bonus.getAgainstTeamPoints();
        }
    }

    addBonusPoints(forTeamID, forTeamPoints, otherTeamPoints) {
        this.bonus.setForTeam(forTeamID);
        this.bonus.setForTeamPoints(forTeamPoints);
        this.bonus.setAgainstTeamPoints(otherTeamPoints);
    }

    removeLastTossup() {
        this.tossup.removeLastAnswer();
    }
}

class Game {
    constructor() {
        this.team1 = null;
        this.team2 = null;
        this.phases = [];
        this.currentPhase = new Phase(1);
    }

    getCurrentPhase() {
        return this.currentPhase;
    }

    deadTossup() {
        this.stashPhase();
    }

    nextPhase() {
        var nextPhaseNum = this.currentPhase.getNumber() + 1;
        this.currentPhase = new Phase(nextPhaseNum);
    }

    stashPhase() {
        console.log("Stashing phase");
        console.log(this.currentPhase);
        this.phases.push(this.currentPhase);
        console.log(this.phases);
        this.nextPhase();
    }

    setTeam(number, name, id, players) {
        if (number == 1) {
            this.team1 = new Team(name, id);
            for (var i = 0; i < players.length; i++) {
                this.team1.players.push(new Player(players[i].player_name, players[i]._id, players[i].teamID));
            }
        } else {
            this.team2 = new Team(name, id);
            for (var i = 0; i < players.length; i++) {
                this.team2.players.push(new Player(players[i].player_name, players[i]._id, players[i].teamID));
            }
        }
    }

    addPlayer(name, id, teamid) {
        var player = new Player(name, id, teamid);
        if (teamid == this.team1.id) {
            this.team1.players.push(player);
        } else {
            this.team2.players.push(player);
        }
    }

    addAnswerToTossup(teamid, playerid, value) {
        this.currentPhase.addAnswerToTossup(teamid, playerid, value);
    }

    getTeamScore(teamid) {
        var score = 0;
        for (var i = 0; i < this.phases.length; i++) {
            var currentTossup = this.phases[i].getTossup();
            var currentBonus = this.phases[i].getBonus();
            for (var j = 0; j < currentTossup.getAnswers().length; j++) {
                var currentAnswer = currentTossup.getAnswers()[j];
                if (currentAnswer.team == teamid) {
                    score += currentAnswer.value;
                }
            }
            if (currentBonus.getForTeam() == teamid) {
                score += currentBonus.getForTeamPoints();
            } else {
                score += currentBonus.getAgainstTeamPoints();
            }
        }
        var tossup = this.currentPhase.getTossup();
        var bonus = this.currentPhase.getBonus();
        for (var j = 0; j < tossup.getAnswers().length; j++) {
            var currentAnswer = tossup.getAnswers()[j];
            if (currentAnswer.team == teamid) {
                score += currentAnswer.value;
            }
        }
        if (bonus.getForTeam() == teamid) {
            score += bonus.getForTeamPoints();
        } else {
            score += bonus.getAgainstTeamPoints();
        }
        return score;
    }

    getTeamScoreUpToPhase(teamid, maxPhase) {
        var score = 0;
        for (var i = 0; i < this.phases.length; i++) {
            if (this.phases[i].getNumber() <= maxPhase) {
                var currentTossup = this.phases[i].getTossup();
                var currentBonus = this.phases[i].getBonus();
                for (var j = 0; j < currentTossup.getAnswers().length; j++) {
                    var currentAnswer = currentTossup.getAnswers()[j];
                    if (currentAnswer.team == teamid) {
                        score += currentAnswer.value;
                    }
                }
            }
        }
        if (this.currentPhase.getNumber() <= maxPhase) {
            var tossup = this.currentPhase.getTossup();
            var bonus = this.currentPhase.getBonus();
            for (var j = 0; j < tossup.getAnswers().length; j++) {
                var currentAnswer = tossup.getAnswers()[j];
                if (currentAnswer.team == teamid) {
                    score += currentAnswer.value;
                }
            }
        }
        return score;
    }

}

var game = new Game();

$(document).ready(function() {

    $(".teamselect").change(function() {
        findPlayers($(this));
    });

    $("body").on("click", ".btn-point", function() {
        if (game.team1 != null && game.team2 != null) {
            game.getCurrentPhase().addAnswerToTossup($(this).attr("data-team"), $(this).attr("data-player"), parseFloat($(this).attr("data-point-value")));
            showAnswersOnScoresheet(game.currentPhase);
            // console.log(game.getTeamScore(game.team1.id) + ", " + game.getTeamScore(game.team2.id));
            showTotalOnScoresheetOneRow(game.getCurrentPhase().getNumber(), $(this).attr("data-team"), game.getTeamScore($(this).attr("data-team")));
            // var i = 1;
            // while (i <= game.getCurrentPhase().getNumber()) {
            //     showTotalOnScoresheetOneRow(i, $(this).attr("data-team"), game.getTeamScoreUpToPhase($(this).attr("data-team"), i));
            //     // console.log(game.getTeamScoreUpToPhase($(this).attr("data-team"), i));
            //     i++;
            // }
            // showTotalOnScoresheetOneRow(game.getCurrentPhase().getNumber(), game.team2.id, game.getTeamScore(game.team2.id));
            if (!$(this).data("neg")) {
                if ($(this).attr("data-team") == game.team1.id) {
                    showBonusScreen(game.team1);
                } else {
                    showBonusScreen(game.team2);
                }
                $("#next-tossup").attr("data-team", $(this).attr('data-team'));
            }
        }
    });

    $("body").on("click", "#next-tossup", function() {
        if (game.team1 != null && game.team2 != null)
            console.log("Going to next tossup");
            var bonusLeft = $("#left-gotten-bonus li").size() * 10;
            var bonusRight = $("#right-gotten-bonus li").size() * 10;
            var forTeamPoints;
            var againstPoints;
            if ($("#left-gotten-bonus").attr("data-team") == $(this).attr('data-team')) {
                forTeamPoints = bonusLeft;
                againstPoints = bonusRight;
            } else {
                forTeamPoints = bonusRight;
                againstPoints = bonusLeft;
            }
            game.getCurrentPhase().addBonusPoints($(this).attr("data-team"), forTeamPoints, againstPoints);
            showBonusOnScoresheetOneRow(game.getCurrentPhase().getNumber(), game.team1.id, game.getCurrentPhase().getBonusPointsForTeam(game.team1.id));
            showBonusOnScoresheetOneRow(game.getCurrentPhase().getNumber(), game.team2.id, game.getCurrentPhase().getBonusPointsForTeam(game.team2.id));
            console.log(game.getCurrentPhase());
            game.stashPhase();
            showTossupDiv();
            if (game.getCurrentPhase().getNumber() > MAX_TOSSUPS) {
                createScoresheetRow(game.team1, game.team2, MAX_TOSSUPS + 1);
                MAX_TOSSUPS++;
            }
            setActiveRow(game.getCurrentPhase());
            showTotalOnScoresheetOneRow(game.getCurrentPhase().getNumber() - 1, game.team1.id, game.getTeamScore(game.team1.id));
            showTotalOnScoresheetOneRow(game.getCurrentPhase().getNumber() - 1, game.team2.id, game.getTeamScore(game.team2.id));
            destroyBonusLabels();
        // var i = 1;
        // while (i <= game.getCurrentPhase().getNumber()) {
        //     showTotalOnScoresheetOneRow(i, game.team1.id, game.getTeamScoreUpToPhase(game.team1.id, i));
        //     showTotalOnScoresheetOneRow(i, game.team2.id, game.getTeamScoreUpToPhase(game.team2.id, i));
        //     // console.log(game.getTeamScoreUpToPhase(game.team1.id, i));
        //     // console.log(game.getTeamScoreUpToPhase(game.team2.id, i));
        //     i++;
        // }
        // console.log(game.getTeamScore(game.team1.id) + ", " + game.getTeamScore(game.team2.id));
    });

    $("body").on("click", ".remove-bonus", function() {
        console.log("Removing bonus");
        $(this).parent().remove();
    });

    $("body").on("click", "#dead-tossup", function() {
        console.log("dead tossup");
        if (game.team1 != null && game.team2 != null) {
            showBonusOnScoresheetOneRow(game.getCurrentPhase().getNumber(), game.team1.id, game.getCurrentPhase().getBonusPointsForTeam(game.team1.id));
            showBonusOnScoresheetOneRow(game.getCurrentPhase().getNumber(), game.team2.id, game.getCurrentPhase().getBonusPointsForTeam(game.team2.id));
            game.deadTossup();
            if (game.getCurrentPhase().getNumber() > MAX_TOSSUPS) {
                createScoresheetRow(game.team1, game.team2, MAX_TOSSUPS + 1);
                MAX_TOSSUPS++;
            }
            setActiveRow(game.getCurrentPhase());
            showTotalOnScoresheetOneRow(game.getCurrentPhase().getNumber() - 1, game.team1.id, game.getTeamScore(game.team1.id));
            showTotalOnScoresheetOneRow(game.getCurrentPhase().getNumber() - 1, game.team2.id, game.getTeamScore(game.team2.id));
        }
    });

    $("body").on("click", ".add-player-button", function() {
        $(this).prop("disabled", true);
        addPlayer($(this).prev(".player-name-input").val(), $(this).attr("data-team"), $(this).attr("data-team-name"), $(this).attr("side"));
    });

    $("#lock-teams").click(function() {
        $("#team-select-div").slideUp("fast");
        $("#lock-teams-div").slideUp("fast");
    });

    $(".add-bonus").click(function() {
        var list = $(this).attr("data-list");
        addBonusRow(list);
    });

});

function findPlayers(side) {
    console.log(game);
    $.ajax({
        url : "/home/tournaments/getplayers",
        type : "GET",
        data : {tournamentid : $("#tournamentid").val(),
                teamname : $(side).val()},
        success : function(databack, status, xhr) {
            changeTeamLabels(side);
            var pointValues = Object.keys(databack.pointScheme);
            createPlayerLabels(side, databack.players, pointValues, databack.pointTypes);
            createPlayerTable(side, databack.players, pointValues);
            if ($(side).attr("id") == "leftselect") {
                game.setTeam(1, $("#leftselect").find(":selected").text(), $("#leftselect").val(), databack.players);
            } else {
                game.setTeam(2, $("#rightselect").find(":selected").text(), $("#rightselect").val(), databack.players);
            }

            if (game.team1 != null && game.team2 != null) {
                createScoresheet(game.team1, game.team2);
                editAddBonusAttributes(game.team1, game.team2);
                createDeadTossupButton();
            }
        }
    });
}

function addPlayer(playerName, teamid, teamName, side) {
    var data = {
            tournamentidform : $("#tournamentid").val(),
            teamnameform : teamName,
            teamidform : teamid,
            newplayername : playerName
    };
    $.ajax({
        url : "/home/tournaments/players/create",
        type : "POST",
        data : data,
        success : function(databack, status, xhr) {
            console.log(databack);
            if (game.team1.id == teamid) {
                appendPlayerLabel("#leftplayerlist", databack.player, Object.keys(databack.pointScheme), databack.pointTypes);
                game.addPlayer(databack.player.player_name, databack.player._id, game.team1.id);
                if ($("#scoresheet").length !== 0) {
                    addPlayerColumn("left", databack.player);
                }
            } else {
                appendPlayerLabel("#rightplayerlist", databack.player, Object.keys(databack.pointScheme), databack.pointTypes);
                game.addPlayer(databack.player.player_name, databack.player._id, game.team2.id);
                if ($("#scoresheet").length !== 0) {
                    addPlayerColumn("right", databack.player);
                }
            }
        },
        complete : function(xhr, status) {
            $(".add-player-button").prop("disabled", false);
        }
    });
}

function createDeadTossupButton() {
    var html = "<button type='button' class='btn btn-md btn-block' id='dead-tossup'> Dead Tossup </button>";
    $("#dead-tossup-div").empty().append(html);
}

function showBonusScreen(primaryTeam) {
    $("#tossups-div").fadeOut(0);
    $("#bonus-div").fadeIn(0);
    $("#team-bonus-name").text("Bonus for " + primaryTeam.name + ", Question " + game.getCurrentPhase().getNumber());
    $("#dead-tossup-div").fadeOut(0);
}

function showTossupDiv() {
    $("#tossups-div").fadeIn(0);
    $("#bonus-div").fadeOut(0);
    $("#dead-tossup-div").fadeIn(0);

}

function createScoresheet(team1, team2) {
    var html = "<thead><tr>";
    for (var i = 0; i < team1.players.length; i++) {
        html += "<th class='player-header' title='" + team1.players[i].name + "'>" + team1.players[i].name.slice(0,2).toUpperCase() + "</th>";
    }
    html += "<th>Bonus</th><th>Total</th>";
    html += "<th class='alert alert-info'> TU # </th>";
    html += "<th>Total</th><th>Bonus</th>";
    for (var i = 0; i < team2.players.length; i++) {
        html += "<th class='player-header' title='" + team2.players[i].name + "'>" + team2.players[i].name.slice(0,2).toUpperCase() + "</th>";
    }
    html += "</tr></thead>";
    html += "<tbody id='scoresheet-body'>";
    for (var i = 0; i < MAX_TOSSUPS; i++) {
        if (i + 1 === game.getCurrentPhase().getNumber()) {
            html += "<tr class='active-row' data-row='" + (i + 1) + "'>";
        } else {
            html += "<tr data-row='" + (i + 1) + "'>";
        }
        for (var j = 0; j < team1.players.length; j++) {
            html += "<td data-player='" + team1.players[j].id + "' data-row='" + (i + 1) + "'>-</td>";
        }
        html += "<td class='bonus-td' data-team='" + team1.id + "' data-row='" + (i + 1) + "'>-</td>";
        html += "<td class='total-td' data-team='" + team1.id + "' data-row='" + (i + 1) + "'>-</td>";
        html += "<td class='alert alert-info'><strong>" + (i + 1) + "</strong></td>";
        html += "<td class='total-td' data-team='" + team2.id + "' data-row='" + (i + 1) + "'>-</td>";
        html += "<td class='bonus-td' data-team='" + team2.id + "' data-row='" + (i + 1) + "'>-</td>";
        for (var j = 0; j < team2.players.length; j++) {
            html += "<td data-player='" + team2.players[j].id + "' data-row='" + (i + 1) + "'>-</td>";
        }
        html += "</tr>";
    }
    html += "</tbody>";
    var colspan = team1.players.length + team2.players.length + 5;
    html += "<tfoot><tr class='alert alert-warning'><td id='tfoot-msg' colspan='" + colspan + "'>More rows will appear as needed.</td></tr></tfoot>";
    $("#scoresheet").empty();
    $(html).hide().appendTo("#scoresheet").fadeIn(300);
}

function createScoresheetRow(team1, team2, number) {
    var html = "<tr data-row='" + number + "'>";
    for (var j = 0; j < team1.players.length; j++) {
        html += "<td data-player='" + team1.players[j].id + "' data-row='" + number + "'>-</td>";
    }
    html += "<td class='bonus-td' data-team='" + team1.id + "' data-row='" + number + "'>-</td>";
    html += "<td class='total-td' data-team='" + team1.id + "' data-row='" + number + "'>-</td>";
    html += "<td class='alert alert-info'><strong>" + number + "</strong></td>";
    html += "<td class='total-td' data-team='" + team2.id + "' data-row='" + number + "'>-</td>";
    html += "<td class='bonus-td' data-team='" + team2.id + "' data-row='" + number + "'>-</td>";
    for (var j = 0; j < team2.players.length; j++) {
        html += "<td data-player='" + team2.players[j].id + "' data-row='" + number + "'>-</td>";
    }
    html += "</tr>";
    $("#scoresheet-body").append(html);
}

function destroyBonusLabels() {
    $("#left-gotten-bonus").empty();
    $("#right-gotten-bonus").empty();
}

function changeTeamLabels(side) {
    if ($(side).attr("id") === "leftselect") {
        $("#team-1-name").html($(side).find(":selected").text());
    } else {
        $("#team-2-name").html($(side).find(":selected").text());
    }
}

function appendPlayerLabel(side, player, pointValues, pointTypes) {
    console.log(pointValues);
    var html = "<div class='row cell'>";
    html += "<div class='col-md-5'>";
    html += "<div class='playerbox'><strong style='color:white'>" + player.player_name + "</strong></div></div>";
    html += "<div class='col-md-7'>";
    html += "<div class='row'>";
    for (var j = 0; j < pointValues.length; j++) {
        if (pointTypes[pointValues[j]] === "N") {
            html += "<button" + " data-team='" + player.teamID + "' data-neg='true' data-point-value='" + pointValues[j]
                + "' data-player='" + player._id + "' class='btn btn-md btn-danger btn-point'>" + pointValues[j] + "</button>";
        } else if (pointTypes[pointValues[j]] === "P") {
            html += "<button" + " data-team='" + player.teamID + "' data-neg='false' data-point-value='" + pointValues[j]
                + "' data-player='" + player._id + "' class='btn btn-md btn-success btn-point'>" + pointValues[j] + "</button>";
        } else {
            html += "<button" + " data-team='" + player.teamID + "' data-neg='false' data-point-value='" + pointValues[j]
                + "' data-player='" + player._id + "' class='btn btn-md btn-info btn-point'>" + pointValues[j] + "</button>";
        }
    }
    html += "</div>";
    html += "</div>";
    html += "</div>";
    if ($(side + " .cell").size() === 0) {
        $(side).prepend(html);
        console.log("No players before");
    } else {
        console.log("Players before");
        $(html).insertAfter($(side + " .cell").last());
    }
}


function createPlayerLabels(side, players, pointValues, pointTypes) {
    var list = $(side).attr("id") === "leftselect" ? "#leftplayerlist" : "#rightplayerlist";
    var html = "";
    for (var i = 0; i < players.length; i++) {
        html += "<div class='row cell'>";
        html += "<div class='col-md-5'>";
        html += "<div class='playerbox'><strong style='color:white'>" + players[i].player_name + "</strong></div></div>";
        html += "<div class='col-md-7'>";
        html += "<div class='row'>";
        for (var j = 0; j < pointValues.length; j++) {
            if (pointTypes[pointValues[j]] === "N") {
                html += "<button" + " data-team='" + players[i].teamID + "' data-neg='true' data-point-value='" + pointValues[j]
                    + "' data-player='" + players[i]._id + "' class='btn btn-md btn-danger btn-point'>" + pointValues[j] + "</button>";
            } else if (pointTypes[pointValues[j]] === "P") {
                html += "<button" + " data-team='" + players[i].teamID + "' data-neg='false' data-point-value='" + pointValues[j]
                    + "' data-player='" + players[i]._id + "' class='btn btn-md btn-success btn-point'>" + pointValues[j] + "</button>";
            } else {
                html += "<button" + " data-team='" + players[i].teamID + "' data-neg='false' data-point-value='" + pointValues[j]
                    + "' data-player='" + players[i]._id + "' class='btn btn-md btn-info btn-point'>" + pointValues[j] + "</button>";
            }
        }
        html += "</div>";
        html += "</div>";
        html += "</div>";
    }
    var teamid = $(side).val();
    var teamname = $(side).find(":selected").text();
    html += "<br><input type='text' class='form-control player-name-input' placeholder='New Player'/><button class='btn btn-md btn-success add-player-button' data-team='"
        + teamid + "' data-team-name='" + teamname + "'> Add a Player </button>";
    $(list).empty().append(html);
}

function createPlayerTable(side, players, pointScheme) {
    var table = $(side).attr("id") === "leftselect" ? "#leftplayertable" : "#rightplayertable";
    var html = "<tr><th></th>";
    for (var i = 0; i < pointScheme.length; i++) {
        html += "<th class='table-head' scope='col'>" + pointScheme[i] + "</th>";
    }
    html += "<th class='table-head' scope='col'>Totals</th>";
    html += "</tr>";
    for (var i = 0; i < players.length; i++) {
        html += "<tr>";
        html += "<th>" + players[i].player_name; + "</th>";
        for (var j = 0; j < pointScheme.length; j++) {
            html += "<td data-player='" + players[i]._id + "' data-point-value='" + pointScheme[j] + "'>0</td>";
        }
        html += "<td>0</td>";
        html += "</tr>";
    }
    $(table).empty().append(html);
}

function lockOutTeam() {
    $("#left-team-players").css("opacity", .3);
    $("#left-team-players :input").prop("disabled", true);
}

function showAnswersOnScoresheet(phase) {
    console.log(phase.getNumber());
    var row = phase.getNumber();
    var answers = phase.getTossup().getAnswers();
    for (var i = 0; i < answers.length; i++) {
        var td = $("td[data-player=" + answers[i].player + "][data-row=" + row + "]");
        $(td).text(answers[i].value);
    }
}

function showTotalOnScoresheetOneRow(row, teamid, total) {
    var td = $(".total-td[data-team=" + teamid + "][data-row=" + row + "]");
    $(td).text(total);
}

function showBonusOnScoresheetOneRow(row, teamid, bonusTotal) {
    var td = $(".bonus-td[data-team=" + teamid + "][data-row=" + row + "]");
    $(td).text(bonusTotal);
}

function setActiveRow(phase) {
    var activeTD = $("tr[data-row=" + phase.getNumber() + "]");
    var unactiveRows = $("tr[data-row!=" + phase.getNumber() + "]");
    $(activeTD).addClass("active-row");
    $(unactiveRows).removeClass("active-row");
}

function addBonusRow(list) {
    var html = "<li class='list-group-item'>10<button class='btn btn-sm btn-danger fa fa-times remove-bonus'></button></li>";
    $(html).hide().appendTo(list).fadeIn(200);
    console.log($(list + " .list-group-item").size());
}

function editAddBonusAttributes(team1, team2) {
    $("#left-bonus-info").text("+10 for " + team1.name);
    $("#right-bonus-info").text("+10 for " + team2.name);
    $("#left-gotten-bonus").attr("data-team", team1.id);
    $("#right-gotten-bonus").attr("data-team", team2.id);
}

function addPlayerColumn(side, player) {
    if (side == "right") {
        $("#scoresheet thead tr").append("<th class='player-header' title='" + player.player_name + "'>" + player.player_name.slice(0, 2).toUpperCase() + "</th>");
        $("#scoresheet tbody tr").each(function(index, tableRow) {
            var row = index + 1;
            $(this).append("<td data-player='" + player._id + "' data-row='" + row + "'>-</td>");
        });
    } else {
        $("#scoresheet thead tr").prepend("<th class='player-header' title='" + player.player_name + "'>" + player.player_name.slice(0, 2).toUpperCase() + "</th>");
        $("#scoresheet tbody tr").each(function(index, tableRow) {
            var row = index + 1;
            $(this).prepend("<td data-player='" + player._id + "' data-row='" + row + "'>-</td>");
        });
    }
    var colspan = game.team1.players.length + game.team2.players.length + 5;
    changeFooterColSpan(colspan);
}

function changeFooterColSpan(colspan) {
    $("#tfoot-msg").attr("colspan", colspan);
}
