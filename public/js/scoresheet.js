'use strict';

var STARTING_TOSSUPS = 20;

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
        var pointsEarned = 0;
        var bonusParts = this.bonus.getBonusParts();
        for (var i = 0; i < bonusParts.length; i++) {
            if (bonusParts[i].answeringTeamID == teamid && BonusParts[i].forTeamID != teamid) {
                pointsEarned += 10;
            }
        }
        return pointsEarned;
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

    addPlayer(id, teamid) {
        var player = new Player(id, teamid);
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
        }
        var tossup = this.currentPhase.getTossup();
        var bonus = this.currentPhase.getBonus();
        for (var j = 0; j < tossup.getAnswers().length; j++) {
            var currentAnswer = tossup.getAnswers()[j];
            if (currentAnswer.team == teamid) {
                score += currentAnswer.value;
            }
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
        console.log("Going to next tossup")
        game.stashPhase();
        showTossupDiv();
        setActiveRow(game.getCurrentPhase());
        showTotalOnScoresheetOneRow(game.getCurrentPhase().getNumber() - 1, game.team1.id, game.getTeamScore(game.team1.id));
        showTotalOnScoresheetOneRow(game.getCurrentPhase().getNumber() - 1, game.team2.id, game.getTeamScore(game.team2.id));
        // var i = 1;
        // while (i <= game.getCurrentPhase().getNumber()) {
        //     showTotalOnScoresheetOneRow(i, game.team1.id, game.getTeamScoreUpToPhase(game.team1.id, i));
        //     showTotalOnScoresheetOneRow(i, game.team2.id, game.getTeamScoreUpToPhase(game.team2.id, i));
        //     // console.log(game.getTeamScoreUpToPhase(game.team1.id, i));
        //     // console.log(game.getTeamScoreUpToPhase(game.team2.id, i));
        //     i++;
        // }
        console.log(game.getTeamScore(game.team1.id) + ", " + game.getTeamScore(game.team2.id));
    });

    $("#lock-teams").click(function() {
        $("#team-select-div").slideUp("fast");
        $("#lock-teams-div").slideUp("fast");
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
            }
        }
    });
}

function showBonusScreen(team) {
    $("#tossups-div").fadeOut(0);
    $("#bonus-div").fadeIn(0);
    $("#team-bonus-name").text("Bonus for " + team.name + ", Question " + game.getCurrentPhase().getNumber());
}

function showTossupDiv() {
    $("#tossups-div").fadeIn(0);
    $("#bonus-div").fadeOut(0);

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
    html += "<tbody>";
    for (var i = 0; i < STARTING_TOSSUPS; i++) {
        if (i + 1 === game.getCurrentPhase().getNumber()) {
            html += "<tr class='active-row' data-row='" + (i + 1) + "'>";
        } else {
            html += "<tr data-row='" + (i + 1) + "'>";
        }
        for (var j = 0; j < team1.players.length; j++) {
            html += "<td data-player='" + team1.players[j].id + "' data-row='" + (i + 1) + "'>-</td>";
        }
        html += "<td class='bonus-td' data-team='" + game.team1.id + "' data-row='" + (i + 1) + "'>-</td>";
        html += "<td class='total-td' data-team='" + game.team1.id + "' data-row='" + (i + 1) + "'>-</td>";
        html += "<td class='alert alert-info'><strong>" + (i + 1) + "</strong></td>";
        html += "<td class='total-td' data-team='" + game.team2.id + "' data-row='" + (i + 1) + "'>-</td>";
        html += "<td class='bonus-td' data-team='" + game.team2.id + "' data-row='" + (i + 1) + "'>-</td>";
        for (var j = 0; j < team2.players.length; j++) {
            html += "<td data-player='" + team2.players[j].id + "' data-row='" + (i + 1) + "'>-</td>";
        }
        html += "</tr>";
    }
    html += "</tbody>";
    $("#scoresheet").empty();
    $(html).hide().appendTo("#scoresheet").fadeIn(300);
}

function changeTeamLabels(side) {
    if ($(side).attr("id") === "leftselect") {
        $("#team-1-name").html($(side).find(":selected").text());
    } else {
        $("#team-2-name").html($(side).find(":selected").text());
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
                html += "<button" + " data-team='" + players[i].teamID + "' data-neg='true' data-point-value='" + pointValues[j] + "' data-player='" + players[i]._id + "' class='btn btn-md btn-danger btn-point'>" + pointValues[j] + "</button>";
            } else if (pointTypes[pointValues[j]] === "P") {
                html += "<button" + " data-team='" + players[i].teamID + "' data-neg='false' data-point-value='" + pointValues[j] + "' data-player='" + players[i]._id + "' class='btn btn-md btn-success btn-point'>" + pointValues[j] + "</button>";
            } else {
                html += "<button" + " data-team='" + players[i].teamID + "' data-neg='false' data-point-value='" + pointValues[j] + "' data-player='" + players[i]._id + "' class='btn btn-md btn-info btn-point'>" + pointValues[j] + "</button>";
            }
        }
        html += "</div>";
        html += "</div>";
        html += "</div>";
    }
    html += "<br><input type='text' class='form-control' placeholder='New Player'/><button class='btn btn-md btn-success'> Add a Player </button>";
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
