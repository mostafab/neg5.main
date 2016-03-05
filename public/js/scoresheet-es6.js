'use strict';

var entityMap = {
   "&": "&amp;",
   "<": "&lt;",
   ">": "&gt;",
   '"': '&quot;',
   "'": '&#39;',
   "/": '&#x2F;'
 };

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
    }

    removeLastAnswer() {
        if (this.answers.length !== 0) {
            return this.answers.pop();
        }
        return null;
    }
}

class BonusPart {
    constructor(number, value, gettingTeam) {
        this.number = number;
        this.gettingTeam = gettingTeam;
        this.value = value;
    }
}

class Bonus {
    constructor() {
        this.forTeam = null;
        this.bonusParts = [];
    }

    setForTeam(teamid) {
        this.forTeam = teamid;
    }

    getForTeam() {
        return this.forTeam;
    }

    getForTeamPoints() {
        var points = 0;
        if (this.forTeam) {
            for (var i = 0; i < this.bonusParts.length; i++) {
                if (this.bonusParts[i].gettingTeam == this.forTeam) {
                    points += this.bonusParts[i].value;
                }
            }
        }
        return points;
    }

    getAgainstTeamPoints() {
        var points = 0;
        if (this.forTeam) {
            for (var i = 0; i < this.bonusParts.length; i++) {
                if (this.bonusParts[i].gettingTeam && this.bonusParts[i].gettingTeam != this.forTeam) {
                    points += this.bonusParts[i].value;
                }
            }
        }
        return points;
    }

    addBonusPart(partNumber, value, gettingTeam) {
        this.bonusParts.push(new BonusPart(partNumber, value, gettingTeam));
    }
}

class Phase {
    constructor(number) {
        this.question_number = number;
        this.tossup = new Tossup();
        this.bonus = new Bonus();
    }

    getNumber() {
        return this.question_number;
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
        return 0;
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
        if (this.bonus.getForTeam() === teamid) {
            return this.bonus.getForTeamPoints();
        } else {
            return this.bonus.getAgainstTeamPoints();
        }
    }

    setBonusTeam(forTeamID) {
        this.bonus.setForTeam(forTeamID);
    }

    addBonusPart(partNumber, value, gettingTeam) {
        this.bonus.addBonusPart(partNumber, value, gettingTeam)
    }

    removeLastTossup() {
        return this.tossup.removeLastAnswer();
    }

    teamAlreadyAnswered(player, team) {
        for (var i = 0; i < this.tossup.answers.length; i++) {
            var ans = this.tossup.answers[i];
            if (ans.player !== player && ans.team === team) {
                return true;
            }
        }
        return false;
    }

    hasCorrectAnswer(pointMap, player) {
        for (var i = 0; i < this.tossup.answers.length; i++) {
            if (pointMap[this.tossup.answers[i].value] !== "N"
                    && this.tossup.answers[i].player !== player) {
                return true;
            }
        }
        return false;
    }

    hasNeg(pointMap, player) {
        for (var i = 0; i < this.tossup.answers.length; i++) {
            if (pointMap[this.tossup.answers[i].value] === "N"
                    && this.tossup.answers[i].player !== player) {
                return true;
            }
        }
        return false;
    }

    removeAnswer(player, pointMap) {
        this.tossup.answers = this.tossup.answers.filter(function(answer) {
            return answer.player !== player;
        });
        var allNegs = true;
        for (var i = 0; i < this.tossup.answers.length; i++) {
            if (pointMap[this.tossup.answers[i].value] !== "N") {
                allNegs = false;
            }
        }
        if (this.tossup.answers.length === 0 || allNegs) {
            this.bonus.forTeam = null;
        }
    }

    replaceAnswer(player, team, value, pointMap) {
        var replaced = false;
        for (var i = 0; i < this.tossup.answers.length; i++) {
            var answer = this.tossup.answers[i];
            if (answer.player === player) {
                answer.value = value;
                replaced = true;
                break;
            }
        }
        if (!replaced) {
            this.tossup.answers.push(new Answer(team, player, value));
            if (pointMap[value] !== "N") {
                this.bonus.forTeam = team;
            }
        }
        var allNegs = true;
        for (var i = 0; i < this.tossup.answers.length; i++) {
            if (pointMap[this.tossup.answers[i].value] !== "N") {
                allNegs = false;
            }
        }
        if (allNegs) {
            this.bonus.forTeam = null;
        } else {
            this.bonus.forTeam = team;
        }
    }

    changeBonusPart(part, value, team) {
        for (var i = 0; i < this.bonus.bonusParts.length; i++) {
            if (this.bonus.bonusParts[i].number === part) {
                this.bonus.bonusParts[i].value = value;
                this.bonus.bonusParts[i].gettingTeam = team;
            }
        }
    }

    removeBonusFromTeam(part, team) {
        for (var i = 0; i < this.bonus.bonusParts.length; i++) {
            if (this.bonus.bonusParts[i].number === part
                && this.bonus.bonusParts[i].gettingTeam === team) {
                    this.bonus.bonusParts[i].gettingTeam = null;
            }
        }
    }
}

class Game {
    constructor() {
        this.team1 = null;
        this.team2 = null;
        this.phases = [];
        this.currentPhase = new Phase(1);
        this.pointScheme = [];
        this.pointMap = {};
        this.maxTossups = 20;
        this.maxActivePlayers = 4;
        this.bonusPointValue = 10;
    }

    getPhases() {
        return this.phases;
    }

    getCurrentPhase() {
        return this.currentPhase;
    }

    deadTossup(bonusParts, bonusValue) {
        for (var i = 0; i < bonusParts; i++) {
            this.currentPhase.bonus.bonusParts.push(new BonusPart(i + 1, bonusValue, null));
        }
        this.stashPhase();
    }

    lastQuestion() {
        this.currentPhase = this.phases.pop();
        this.currentPhase.tossup.answers = [];
        this.currentPhase.bonus.bonusParts = [];
        this.currentPhase.bonus.forTeam = null;
    }

    nextPhase() {
        var nextPhaseNum = this.currentPhase.getNumber() + 1;
        if (nextPhaseNum > this.phases.length) {
            this.currentPhase = new Phase(nextPhaseNum);
        } else {
            this.currentPhase = this.phases[nextPhaseNum - 1];
        }
    }

    stashPhase() {
        if (this.phases.length < this.currentPhase.getNumber()) {
            this.phases.push(this.currentPhase);
        } else {
            this.phases[this.currentPhase.getNumber() - 1] = this.currentPhase;
        }
        this.nextPhase();
    }

    getPlayerTeam(playerid) {
        var team1 = this.team1.players.filter(function(player) {
            return player.id === playerid;
        });
        if (team1.length === 0) {
            return this.team2.id;
        } else {
            return this.team1.id;
        }
    }

    setTeam(number, name, id, players) {
        if (number == 1) {
            this.team1 = new Team(name, id);
            for (var i = 0; i < players.length; i++) {
                this.team1.players.push(new Player(players[i].player_name, players[i]._id, players[i].teamID));
            }
            // this.team1.players.sort(function(player1, player2) {
            //     return player1.name.localeCompare(player2.name);
            // });
        } else {
            this.team2 = new Team(name, id);
            for (var i = 0; i < players.length; i++) {
                this.team2.players.push(new Player(players[i].player_name, players[i]._id, players[i].teamID));
            }
            // this.team2.players.sort(function(player1, player2) {
            //     return player1.name.localeCompare(player2.name);
            // });
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

    getPlayersPointValues(team) {
        var teamid = team.id;
        var playerScores = {};
        var allPlayers = teamid == this.team1.id ? this.team1.players : this.team2.players;
        for (var i = 0; i < allPlayers.length; i++) {
            playerScores[allPlayers[i].id] = {};
        }

        for (var i = 0; i < this.phases.length; i++) {
            var currentTossup = this.phases[i].getTossup();
            for (var j = 0; j < currentTossup.getAnswers().length; j++) {
                var answer = currentTossup.getAnswers()[j];
                if (answer.team == teamid) {
                    if (!playerScores[answer.player]) {
                        playerScores[answer.player] = {};
                    }
                    if (!playerScores[answer.player][answer.value + ""]) {
                        playerScores[answer.player][answer.value + ""] = 1;
                    } else {
                        playerScores[answer.player][answer.value + ""]++;
                    }
                }
            }
        }
        var currentTossup = this.currentPhase.getTossup();
        for (var j = 0; j < currentTossup.getAnswers().length; j++) {
            var answer = currentTossup.getAnswers()[j];
            if (answer.team == teamid) {
                if (!playerScores[answer.player][answer.value + ""]) {
                    playerScores[answer.player][answer.value + ""] = 1;
                } else {
                    playerScores[answer.player][answer.value + ""]++;
                }
            }
        }
        return playerScores;
    }

    getAllPlayerScores() {
        var playerScores = {};
        var allPlayers = this.team1.players.concat(this.team2.players);
        for (var i = 0; i < allPlayers.length; i++) {
            playerScores[allPlayers[i].id] = {total : 0};
        }
        for (var i = 0; i < this.phases.length; i++) {
            var currentTossup = this.phases[i].getTossup();
            for (var j = 0; j < currentTossup.getAnswers().length; j++) {
                var answer = currentTossup.getAnswers()[j];
                if (!playerScores[answer.player]) {
                    playerScores[answer.player] = {};
                }
                if (!playerScores[answer.player]["total"]) {
                    playerScores[answer.player]["total"] = answer.value;
                } else {
                    playerScores[answer.player]["total"] += answer.value;
                }
                if (!playerScores[answer.player][answer.value + ""]) {
                    playerScores[answer.player][answer.value + ""] = 1;
                } else {
                    playerScores[answer.player][answer.value + ""]++;
                }
            }
        }
        var currentTossup = this.currentPhase.getTossup();
        for (var j = 0; j < currentTossup.getAnswers().length; j++) {
            var answer = currentTossup.getAnswers()[j];
            if (!playerScores[answer.player]) {
                playerScores[answer.player] = {};
            }
            if (!playerScores[answer.player]["total"]) {
                playerScores[answer.player]["total"] = answer.value;
            } else {
                playerScores[answer.player]["total"] += answer.value;
            }
            if (!playerScores[answer.player][answer.value + ""]) {
                playerScores[answer.player][answer.value + ""] = 1;
            } else {
                playerScores[answer.player][answer.value + ""]++;
            }
        }
        return playerScores;
    }

    getPlayerScore(player) {
        var playerid = player.id;
        var score = 0;
        for (var i = 0; i < this.phases.length; i++) {
            var currentTossup = this.phases[i].getTossup();
            for (var j = 0; j < currentTossup.getAnswers().length; j++) {
                var answer = currentTossup.getAnswers()[j];
                if (answer.player == playerid) {
                    score += answer.value;
                }
            }
        }
        var tossup = this.currentPhase.getTossup();
        for (var j = 0; j < tossup.getAnswers().length; j++) {
            var currentAnswer = tossup.getAnswers()[j];
            if (currentAnswer.player == playerid) {
                score += currentAnswer.value;
            }
        }
        return score;
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

    getTeamBouncebacks(teamid) {
        var points = 0;
        for (var i = 0; i < this.phases.length; i++) {
            var currentBonus = this.phases[i].getBonus();
            if (currentBonus.getForTeam() != teamid) {
                points += currentBonus.getAgainstTeamPoints();
            }
        }
        var tossup = this.currentPhase.getTossup();
        var bonus = this.currentPhase.getBonus();
        if (bonus.getForTeam() != teamid) {
            points += bonus.getAgainstTeamPoints();
        }
        return points;
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
                if (currentBonus.forTeam) {
                    for (var j = 0; j < currentBonus.bonusParts.length; j++) {
                        if (currentBonus.bonusParts[j].gettingTeam === teamid) {
                            score += currentBonus.bonusParts[j].value;
                        }
                    }
                }
            }
        }
        return score;
    }

}

var game = new Game();

$(document).ready(function() {

    $(".teamselect").change(function() {
        $(this).each(function() {
            $(this).css("color", "black");
        });
        findPlayers($(this));
    });

    $("#dismiss-error").click(function() {
        $("#error-div").fadeOut(0);
    });

    $(window).bind("beforeunload", function() {
        return "You will lose this scoresheet info if you leave/reload.";
    });

    $("body").on("click", ".btn-point", function() {
        if (game.team1 != null && game.team2 != null) {
            game.getCurrentPhase().addAnswerToTossup($(this).attr("data-team"), $(this).attr("data-player"), parseFloat($(this).attr("data-point-value")));
            showAnswersOnScoresheet(game.currentPhase);
            showTotalOnScoresheetOneRow(game.getCurrentPhase().getNumber(), $(this).attr("data-team"), game.getTeamScore($(this).attr("data-team")));
            if (!$(this).data("neg")) {
                if ($(this).attr("data-team") == game.team1.id) {
                    showBonusScreen(game.team1);
                } else {
                    showBonusScreen(game.team2);
                }
                $("#next-tossup").attr("data-team", $(this).attr('data-team'));
            } else {
                setNegButtonPlayer($(this).parent(".player-list").next(".neg-box").find(".undo-neg"), $(this).attr("data-player"));
                $(".btn-point[data-neg='" + "true" + "']").fadeOut(0);
                lockOutTeam($(this));
            }
            showPlayerPointTotals(game);
        }
    });

    $("body").on("click", "#next-tossup", function() {
        if (game.team1 !== null && game.team2 !== null) {
            $(".bonus-phase").each(function(index) {
                var bonusButton = $(this).find(".gotten-bonus").first();
                game.getCurrentPhase().addBonusPart(index + 1, game.bonusPointValue, $(bonusButton).attr("data-team"));
            });
            game.getCurrentPhase().setBonusTeam($(this).attr("data-team"));

            showBonusOnScoresheetOneRow(game.getCurrentPhase().getNumber(), game.team1.id, game.getCurrentPhase().getBonusPointsForTeam(game.team1.id));
            showBonusOnScoresheetOneRow(game.getCurrentPhase().getNumber(), game.team2.id, game.getCurrentPhase().getBonusPointsForTeam(game.team2.id));
            game.stashPhase();
            showTossupDiv();
            if (game.getCurrentPhase().getNumber() > game.maxTossups) {
                createScoresheetRow(game.team1, game.team2, game.maxTossups + 1);
                game.maxTossups++;
            }
            setActiveRow(game.getCurrentPhase());
            showTotalOnScoresheetOneRow(game.getCurrentPhase().getNumber() - 1, game.team1.id, game.getTeamScore(game.team1.id));
            showTotalOnScoresheetOneRow(game.getCurrentPhase().getNumber() - 1, game.team2.id, game.getTeamScore(game.team2.id));
            destroyBonusLabels();
            unlockBothTeams();
            $(".btn-point[data-neg='" + "true" + "']").fadeIn(0);
            incrementTossupsHeardForPlayers(1);
        }
    });

    $("body").on("click", "#dead-tossup", function() {
        if (game.team1 !== null && game.team2 !== null) {
            showBonusOnScoresheetOneRow(game.getCurrentPhase().getNumber(), game.team1.id, game.getCurrentPhase().getBonusPointsForTeam(game.team1.id));
            showBonusOnScoresheetOneRow(game.getCurrentPhase().getNumber(), game.team2.id, game.getCurrentPhase().getBonusPointsForTeam(game.team2.id));
            game.deadTossup(3, game.bonusPointValue);
            if (game.getCurrentPhase().getNumber() > game.maxTossups) {
                createScoresheetRow(game.team1, game.team2, game.maxTossups + 1);
                game.maxTossups++;
            }
            setActiveRow(game.getCurrentPhase());
            showTotalOnScoresheetOneRow(game.getCurrentPhase().getNumber() - 1, game.team1.id, game.getTeamScore(game.team1.id));
            showTotalOnScoresheetOneRow(game.getCurrentPhase().getNumber() - 1, game.team2.id, game.getTeamScore(game.team2.id));
            unlockBothTeams();
            $(".btn-point[data-neg='" + "true" + "']").fadeIn(0);
            incrementTossupsHeardForPlayers(1);
        }
    });

    $("body").on("click", "#submit-game", function() {
        var parsedGame = parseScoresheet(game);
        $(this).prop("disabled", true);
        submitScoresheet(game, parsedGame);
    });

    $("body").on("keydown", ".player-name-input", function(e) {
        $(this).css("border-color", "white");
        if (e.which === 13 && $(this).val().trim().length !== 0) {
            var button = $(this).next(".add-player-button");
            var player = $(this).val();
            var teamid = button.attr("data-team");
            var team = button.attr("data-team-name");
            addPlayer(escapeHtml(player), teamid, team);
        } else if (e.which === 13 && $(this).val().trim().length === 0) {
            $(this).css("border-color", "red");
        }
    });

    $("body").on("click", ".add-player-button", function() {
        $(this).prev(".player-name-input").css("border-color", "transparent");
        if ($(this).prev(".player-name-input").val().length !== 0) {
            $(this).prop("disabled", true);
            addPlayer(escapeHtml($(this).prev(".player-name-input").val()), $(this).attr("data-team"), $(this).attr("data-team-name"));
        } else {
            $(this).prev(".player-name-input").css("border-color", "red");
        }
    });

    $("body").on("click", "#undo-tossup", function() {
        var lastAnswer = game.getCurrentPhase().removeLastTossup();
        revertPlayerAnswerOnScoresheet(lastAnswer, game.getCurrentPhase().getNumber());
        destroyBonusLabels();
        showTossupDiv();
        showPlayerPointTotals(game);
    });

    $('body').ajaxStart(function() {
            $(this).css({'cursor' : 'wait'});
        }).ajaxStop(function() {
            $(this).css({'cursor' : 'default'});
        });

    $("#lock-teams").click(function() {
        $(".teamselect").each(function() {
            $(this).css("color", "white");
        });
        if (game.team1 && game.team2) {
            $("#team-select-div").slideUp("fast");
            $("#lock-teams-div").slideUp("fast");
        } else {
            if (!game.team1) {
                $("#leftselect").css("color", "#D9534F");
            }
            if (!game.team2) {
                $("#rightselect").css("color", "#D9534F");
            }
        }

    });

    $(".undo-neg").click(function() {
        var lastAnswer = game.getCurrentPhase().removeLastTossup();
        revertPlayerAnswerOnScoresheet(lastAnswer, game.getCurrentPhase().getNumber());
        unlockTeam($(this));
        $(".btn-point[data-neg='" + "true" + "']").fadeIn(0);
        showPlayerPointTotals(game);
    });

    $("body").on("click", ".player-table .player-body", function(e) {
        if (!$(e.target).is("input")) {
            $(this).find("th").toggleClass("active-player");
            $(this).find("td").toggleClass("active-player");
            var playerid = $(this).attr("data-player");
            $(".player-list > .cell[data-player='" + playerid + "']").toggleClass("active-player").toggle();
        }
    });

    $("body").on("click", "#scoresheet tbody td:not(.tossup-number, .total-td, .bonus-td, .editing)", function(e) {
        e.stopPropagation();
        replaceTossupTD($(this), game);
    });

    $("body").on("mousedown", ".bonus-select option", function(e) {
        this.selected = !this.selected;
        e.preventDefault();
    });

    $("body").on("click", "#scoresheet tbody .bonus-td:not(.editing)", function(e) {
        e.stopPropagation();
        replaceBonusTD($(this), game);
    });

    $("body").on("click", ".confirm-change-bonus", function() {
        var parent = $(this).parent();
        var index = parseInt(parent.attr('data-row')) - 1;
        var team = parent.attr("data-team");
        var select = $(this).siblings(".bonus-select");
        select.children("option:selected").each(function() {
            var part = parseInt($(this).attr('data-part'));
            var value = parseInt($(this).val());
            game.getPhases()[index].changeBonusPart(part, value, team);
        });
        select.children("option:not(:selected)").each(function() {
            var part = parseInt($(this).attr('data-part'));
            game.getPhases()[index].removeBonusFromTeam(part, team);
        });
        parent.empty().removeClass("editing");
        for (var i = index; i < game.getPhases().length; i++) {
            var total = game.getTeamScoreUpToPhase(game.team1.id, i + 1);
            var total2 = game.getTeamScoreUpToPhase(game.team2.id, i + 1);
            showTotalOnScoresheetOneRow(i + 1, game.team1.id, total);
            showTotalOnScoresheetOneRow(i + 1, game.team2.id, total2);
        }
        var bonus = game.getPhases()[index].getBonusPointsForTeam(game.team1.id);
        var bonus2 = game.getPhases()[index].getBonusPointsForTeam(game.team2.id);
        showBonusOnScoresheetOneRow(index + 1, game.team1.id, bonus);
        showBonusOnScoresheetOneRow(index + 1, game.team2.id, bonus2);
    });

    $("body").on("click", ".confirm-change-tossup", function() {
        var parent = $(this).parent();
        var index = parseInt(parent.attr("data-row")) - 1;
        var player = parent.attr("data-player");
        var value = $(this).siblings("select").val();
        var team = game.getPlayerTeam(player);
        if (value === "-") {
            game.getPhases()[index].removeAnswer(player, game.pointMap);
        } else {
            game.getPhases()[index].replaceAnswer(player, team, parseFloat(value), game.pointMap);
        }
        parent.empty().text(value).removeClass("editing");
        for (var i = index; i < game.getPhases().length; i++) {
            var total = game.getTeamScoreUpToPhase(game.team1.id, i + 1);
            var total2 = game.getTeamScoreUpToPhase(game.team2.id, i + 1);
            showTotalOnScoresheetOneRow(i + 1, game.team1.id, total);
            showTotalOnScoresheetOneRow(i + 1, game.team2.id, total2);
        }
        var bonus = game.getPhases()[index].getBonusPointsForTeam(game.team1.id);
        var bonus2 = game.getPhases()[index].getBonusPointsForTeam(game.team2.id);
        showBonusOnScoresheetOneRow(index + 1, game.team1.id, bonus);
        showBonusOnScoresheetOneRow(index + 1, game.team2.id, bonus2);
        showPlayerPointTotals(game);
    });

    $("body").on("click", ".cancel-change", function() {
        var oldValue = $(this).attr("data-point");
        var parentTD = $(this).parents("td");
        parentTD.empty().text(oldValue).removeClass("editing");
    });

    $("body").on("click", "#last-tossup", function() {
        var phaseNum = game.getCurrentPhase().getNumber();
        if (game.phases[phaseNum - 2]) {
            game.lastQuestion();
            $("td[data-row='" + game.getCurrentPhase().getNumber() + "']:not(.tossup-number)").text("-");
            $("td[data-row='" + (game.getCurrentPhase().getNumber() + 1) + "']:not(.tossup-number)").text("-");
            setActiveRow(game.getCurrentPhase());
            incrementTossupsHeardForPlayers(-1);
            showPlayerPointTotals(game);
            unlockBothTeams();
            $(".btn-point[data-neg='" + "true" + "']").fadeIn(0);
        }
    });

    $("#undo-game").click(function() {
        $(this).prop("disabled", true);
        undoGameSubmission($(this).attr("data-tournament"), $(this).attr("data-game"));
    });

    $(".bonus-part").click(function() {
        $(this).toggleClass("gotten-bonus").toggleClass("not-gotten-bonus");
        if ($(this).hasClass("gotten-bonus")) {
            var row = $(this).attr("data-toggle-row");
            var cousin = $(".bonus-part[data-toggle-row=" + row + "]").not(this);
            if ($(cousin).hasClass("gotten-bonus")) {
                $(cousin).removeClass("gotten-bonus").addClass("not-gotten-bonus");
            }
        }
    });

});

function findPlayers(side) {
    $.ajax({
        url : "/tournaments/getplayers",
        type : "GET",
        data : {tournamentid : $("#tournamentid").val(),
                teamname : $(side).val()},
        success : function(databack, status, xhr) {
            changeTeamLabels(side);
            var pointValues = Object.keys(databack.pointScheme).sort(function(first, second) {
                return parseFloat(second) - parseFloat(first);
            });
            game.pointScheme = pointValues;
            game.pointMap = databack.pointTypes;
            if ($(side).attr("id") == "leftselect") {
                game.setTeam(1, $("#leftselect").find(":selected").text(), $("#leftselect").val(), databack.players);
                createPlayerTable(side, game.team1.players, pointValues);
                createPlayerLabels(side, game.team1.players, pointValues, databack.pointTypes);
            } else {
                game.setTeam(2, $("#rightselect").find(":selected").text(), $("#rightselect").val(), databack.players);
                createPlayerTable(side, game.team2.players, pointValues);
                createPlayerLabels(side, game.team2.players, pointValues, databack.pointTypes);
            }
            if (game.team1 !== null && game.team2 !== null) {
                createScoresheet(game.team1, game.team2);
                editAddBonusAttributes(game.team1, game.team2);
                createSubmitGameButton();
                $("#dead-tossup-div").fadeIn(0);
                $("#toggle-message-div").fadeIn(200);
            }
        }
    });
}

function addPlayer(playerName, teamid, teamName) {
    var data = {
            tournamentidform : $("#tournamentid").val(),
            teamnameform : teamName,
            teamidform : teamid,
            newplayername : playerName
    };
    $.ajax({
        url : "/tournaments/players/create",
        type : "POST",
        data : data,
        success : function(databack, status, xhr) {
            var pointScheme = Object.keys(databack.pointScheme).sort(function(first, second) {
                return parseFloat(second) - parseFloat(first);
            });
            if (game.team1.id == teamid) {
                appendPlayerLabel("#leftplayerlist", databack.player, pointScheme, databack.pointTypes);
                game.addPlayer(databack.player.player_name, databack.player._id, game.team1.id);
                if ($("#scoresheet").length !== 0) {
                    addPlayerColumn("left", databack.player);
                }
                addPlayerTableRow("left", game.team1.players[game.team1.players.length - 1], pointScheme);
            } else {
                appendPlayerLabel("#rightplayerlist", databack.player, pointScheme, databack.pointTypes);
                game.addPlayer(databack.player.player_name, databack.player._id, game.team2.id);
                if ($("#scoresheet").length !== 0) {
                    addPlayerColumn("right", databack.player);
                }
                addPlayerTableRow("right", game.team2.players[game.team2.players.length - 1], pointScheme);
            }
            $(".player-name-input").val("");
        },
        complete : function(xhr, status) {
            $(".add-player-button").prop("disabled", false);
        }
    });
}

function submitScoresheet(game, parsedScoresheet) {
    var data = {
                "tournamentid" : $("#tournamentid").val(),
                "scoresheet" : game,
                "game" : parsedScoresheet,
    };
    $.ajax({
        url : "/tournaments/scoresheet/submit",
        type : "POST",
        data : data,
        success : function(databack, status, xhr) {
            $("#dead-tossup-div").slideUp(400);
            $("#submit-game-div").slideUp(400);
            setGameAnchorTag(databack.gameid);
            $("#goto-game-div").slideDown(400);
        },
        error : function(xhr, status, err) {
            if (xhr.status === 401) {
                $("#error-div").fadeIn(0);
                $("#error-msg").text(xhr.status + ": " + "You're not logged in!");
            } else if (xhr.status === 500) {
                $("#error-div").fadeIn(0);
                $("#error-msg").text(xhr.status + ": Couldn't submit scoresheet!");
            }
        },
        complete : function() {
            $("#submit-game").prop("disabled", false);
        }
    });
}

function undoGameSubmission(tournament, game) {
    $.ajax({
        url : "/tournaments/games/remove",
        type : "POST",
        data : {
            gameid_form : game,
            tournament_idgame : tournament
        },
        success : function(databack, status, xhr) {
            $("#dead-tossup-div").slideDown(400);
            $("#submit-game-div").slideDown(400);
            $("#goto-game-div").slideUp(400);
            $("#undo-game").prop("disabled", false);
        }
    });
}

function replaceTossupTD(td, game) {
    var row = td.attr("data-row");
    var player = td.attr("data-player");
    var team = game.getPlayerTeam(player);
    var validAnswerTypes = [];
    var phase = game.getPhases()[row - 1];
    if (phase) {
        if (phase.hasNeg(game.pointMap, player)) {
            validAnswerTypes = game.pointScheme.filter(function(value) {
                return game.pointMap[value] !== "N";
            });
        } else if (phase.hasCorrectAnswer(game.pointMap, player)) {
            validAnswerTypes = game.pointScheme.filter(function(value) {
                return game.pointMap[value] === "N";
            });
        } else {
            validAnswerTypes = game.pointScheme;
        }
        if (!phase.teamAlreadyAnswered(player, team)
                && validAnswerTypes.length !== 0) {
            var currentVal = td.text();
            var html = "<select class='input-xs center-text'><option value='-'>-</option>";
            for (var i = 0; i < validAnswerTypes.length; i++) {
                var option = "";
                if (currentVal == validAnswerTypes[i]) {
                    option = "<option selected value='" + validAnswerTypes[i] + "'>" + validAnswerTypes[i] + "</option>";
                } else {
                    option = "<option value='" + validAnswerTypes[i] + "'>" + validAnswerTypes[i] + "</option>";
                }
                html += option;
            }
            html += "</select><button class='btn btn-sm btn-danger cancel-change' data-point='" + currentVal + "'></button><button class='btn btn-sm btn-success confirm-change-tossup'></button>";
            td.addClass("editing").html(html);
        }
    }
}

function replaceBonusTD(td, game) {
    var row = td.attr("data-row");
    var team = td.attr("data-team");
    if (game.getPhases()[row - 1] && game.getPhases()[row - 1].bonus.forTeam) {
        var currentVal = td.text();
        var html = "<select multiple size='3' class='input-xs center-text form-control bonus-select'>";
        var bonusParts = game.getPhases()[row - 1].bonus.bonusParts;
        for (var i = 0; i < bonusParts.length; i++) {
            if (bonusParts[i].gettingTeam === team) {
                html += "<option selected value='" +  bonusParts[i].value + "' data-part=" + bonusParts[i].number + ">" + bonusParts[i].value + "</option>";
            } else {
                html += "<option value='" +  bonusParts[i].value + "' data-part=" + bonusParts[i].number + ">" + bonusParts[i].value + "</option>";
            }
        }
        html += "</select><button class='btn btn-sm btn-danger cancel-change' data-point='" + currentVal + "'></button><button class='btn btn-sm btn-success confirm-change-bonus'></button>";
        td.addClass("editing").html(html);
    }
}

function setGameAnchorTag(gameid) {
    var tournament = $("#goto-game").attr("data-tournament");
    var href = "/t/" + tournament + "/games/" + gameid;
    $("#goto-game").attr("href", href);
    $("#undo-game").attr('data-game', gameid);
}

function parseScoresheet(submittedGame) {
    var gameToAdd = {};
    gameToAdd.team1 = {};
    gameToAdd.team2 = {};
    gameToAdd.team1.team_id = submittedGame.team1.id;
    gameToAdd.team1.score = submittedGame.getTeamScore(submittedGame.team1.id);
    gameToAdd.team1.bouncebacks = submittedGame.getTeamBouncebacks(submittedGame.team1.id);
    gameToAdd.team1.playerStats = submittedGame.getPlayersPointValues(submittedGame.team1);
    gameToAdd.team2.team_id = submittedGame.team2.id;
    gameToAdd.team2.score = submittedGame.getTeamScore(submittedGame.team2.id);
    gameToAdd.team2.bouncebacks = submittedGame.getTeamBouncebacks(submittedGame.team2.id);
    gameToAdd.team2.playerStats = submittedGame.getPlayersPointValues(submittedGame.team2);
    gameToAdd.round = $("#round-number").val();
    gameToAdd.tossupsheard = submittedGame.getPhases().length;
    gameToAdd.room = $("#room-number").val();
    gameToAdd.moderator = $("#moderator").val();
    gameToAdd.packet = $("#packet").val();
    gameToAdd.phase_id = $("#phase").val();
    gameToAdd.notes = $("#notes").val();
    gameToAdd.overtime_tossups = $("#overtime-tossups").val();
    for (var playerid in gameToAdd.team1.playerStats) {
        if (gameToAdd.team1.playerStats.hasOwnProperty(playerid)) {
            if (gameToAdd.tossupsheard !== 0) {
                gameToAdd.team1.playerStats[playerid].gp = (findTossupsHeardForPlayer(playerid) / gameToAdd.tossupsheard).toFixed(2);
            } else {
                gameToAdd.team1.playerStats[playerid].gp = 0;
            }
        }
    }
    for (var playerid in gameToAdd.team2.playerStats) {
        if (gameToAdd.team2.playerStats.hasOwnProperty(playerid)) {
            if (gameToAdd.tossupsheard !== 0) {
                gameToAdd.team2.playerStats[playerid].gp = (findTossupsHeardForPlayer(playerid) / gameToAdd.tossupsheard).toFixed(2);
            } else {
                gameToAdd.team2.playerStats[playerid].gp = 0;
            }
        }
    }
    return gameToAdd;
}

function incrementTossupsHeardForPlayers(number) {
    $(".player-table .active-player input").each(function(index, input) {
        var currentTUH = parseFloat($(input).val());
        $(input).val((currentTUH + number) + "");
    });
}

function createSubmitGameButton() {
    var html = "<button type='button' class='btn btn-lg btn-block btn-stats' id='submit-game'> Submit Game </button>";
    $("#submit-game-div").empty().append(html);
}

function showBonusScreen(primaryTeam) {
    $("#tossups-div").fadeOut(0);
    $("#bonus-div").fadeIn(0);
    $("#team-bonus-name").text("Bonus for " + primaryTeam.name + ", Question " + game.getCurrentPhase().getNumber());
    $("#dead-tossup-div").fadeOut(0);
    $("#submit-game-div").fadeOut(0);
}

function showTossupDiv() {
    $("#tossups-div").fadeIn(0);
    $("#bonus-div").fadeOut(0);
    $("#dead-tossup-div").fadeIn(0);
    $("#submit-game-div").fadeIn(0);
}

function findTossupsHeardForPlayer(playerid) {
    return parseFloat($(".player-tossups[data-player=" + playerid + "] input").val());
}

function createScoresheet(team1, team2) {
    var html = "<thead><tr>";
    for (var i = 0; i < team1.players.length; i++) {
        html += "<th class='player-header' data-toggle='tooltip' data-container='body' title='" + team1.players[i].name + "'>" + team1.players[i].name.slice(0,2).toUpperCase() + "</th>";
    }
    html += "<th>Bonus</th><th>Total</th>";
    html += "<th class='alert alert-info'> TU # </th>";
    html += "<th>Total</th><th>Bonus</th>";
    for (var i = 0; i < team2.players.length; i++) {
        html += "<th class='player-header' data-toggle='tooltip' data-container='body' title='" + team2.players[i].name + "'>" + team2.players[i].name.slice(0,2).toUpperCase() + "</th>";
    }
    html += "</tr></thead>";
    html += "<tbody id='scoresheet-body'>";
    for (var i = 0; i < game.maxTossups; i++) {
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
        html += "<td class='alert alert-info tossup-number'><strong>" + (i + 1) + "</strong></td>";
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
    $(html).hide().appendTo("#scoresheet").fadeIn(500);
    $('[data-toggle="tooltip"]').tooltip();

}

function createScoresheetRow(team1, team2, number) {
    var html = "<tr data-row='" + number + "'>";
    for (var j = 0; j < team1.players.length; j++) {
        html += "<td data-player='" + team1.players[j].id + "' data-row='" + number + "'>-</td>";
    }
    html += "<td class='bonus-td' data-team='" + team1.id + "' data-row='" + number + "'>-</td>";
    html += "<td class='total-td' data-team='" + team1.id + "' data-row='" + number + "'>-</td>";
    html += "<td class='alert alert-info tossup-number'><strong>" + number + "</strong></td>";
    html += "<td class='total-td' data-team='" + team2.id + "' data-row='" + number + "'>-</td>";
    html += "<td class='bonus-td' data-team='" + team2.id + "' data-row='" + number + "'>-</td>";
    for (var j = 0; j < team2.players.length; j++) {
        html += "<td data-player='" + team2.players[j].id + "' data-row='" + number + "'>-</td>";
    }
    html += "</tr>";
    $("#scoresheet-body").append(html);
}

function destroyBonusLabels() {
    $(".bonus-part").removeClass("gotten-bonus").addClass("not-gotten-bonus");
}

function changeTeamLabels(side) {
    if ($(side).attr("id") === "leftselect") {
        $("#team-1-name").html($(side).find(":selected").text());
    } else {
        $("#team-2-name").html($(side).find(":selected").text());
    }
}

function appendPlayerLabel(side, player, pointValues, pointTypes) {
    var html = "<div class='row cell' data-player='" + player._id + "' style='display:none'>";
    html += "<div class='col-md-5'>";
    html += "<div class='playerbox'><strong style='color:white'>" + player.player_name + "</strong></div></div>";
    html += "<div class='col-md-7'>";
    html += "<div class='row'>";
    for (var j = 0; j < pointValues.length; j++) {
        if (pointTypes[pointValues[j]] === "N") {
            html += "<button" + " data-team='" + player.teamID + "' data-neg='true' data-point-value='" + pointValues[j] +
                "' data-player='" + player._id + "' class='btn btn-md btn-danger btn-point'>" + pointValues[j] + "</button>";
        } else if (pointTypes[pointValues[j]] === "P") {
            html += "<button" + " data-team='" + player.teamID + "' data-neg='false' data-point-value='" + pointValues[j] +
                "' data-player='" + player._id + "' class='btn btn-md btn-success btn-point'>" + pointValues[j] + "</button>";
        } else {
            html += "<button" + " data-team='" + player.teamID + "' data-neg='false' data-point-value='" + pointValues[j] +
                "' data-player='" + player._id + "' class='btn btn-md btn-info btn-point'>" + pointValues[j] + "</button>";
        }
    }
    html += "</div>";
    html += "</div>";
    html += "</div>";
    if ($(side + " .cell").size() === 0) {
        $(side).prepend(html);
    } else {
        $(html).insertAfter($(side + " .cell").last());
    }
}


function createPlayerLabels(side, players, pointValues, pointTypes) {
    var list = $(side).attr("id") === "leftselect" ? "#leftplayerlist" : "#rightplayerlist";
    var html = "";
    for (var i = 0; i < players.length; i++) {
        if (i < game.maxActivePlayers) {
            html += "<div class='row cell active-player' data-player='" + players[i].id + "'>";
        } else {
            html += "<div class='row cell' data-player='" + players[i].id + "' style='display:none'>";
        }
        html += "<div class='col-md-5'>";
        html += "<div class='playerbox'><strong style='color:white'>" + players[i].name + "</strong></div></div>";
        html += "<div class='col-md-7'>";
        html += "<div class='row'>";
        for (var j = 0; j < pointValues.length; j++) {
            if (pointTypes[pointValues[j]] === "N") {
                html += "<button" + " data-team='" + players[i].teamid + "' data-neg='true' data-point-value='" + pointValues[j] +
                    "' data-player='" + players[i].id + "' class='btn btn-md btn-danger btn-point'>" + pointValues[j] + "</button>";
            } else if (pointTypes[pointValues[j]] === "P") {
                html += "<button" + " data-team='" + players[i].teamid + "' data-neg='false' data-point-value='" + pointValues[j] +
                    "' data-player='" + players[i].id + "' class='btn btn-md btn-success btn-point'>" + pointValues[j] + "</button>";
            } else {
                html += "<button" + " data-team='" + players[i].teamid + "' data-neg='false' data-point-value='" + pointValues[j] +
                    "' data-player='" + players[i].id + "' class='btn btn-md btn-info btn-point'>" + pointValues[j] + "</button>";
            }
        }
        html += "</div>";
        html += "</div>";
        html += "</div>";
    }
    var teamid = $(side).val();
    var teamname = $(side).find(":selected").text();
    html += "<br><input type='text' class='form-control player-name-input' placeholder='New Player'/><button class='btn btn-md btn-success add-player-button' data-team='" +
        teamid + "' data-team-name='" + teamname + "'> Add a Player </button>";
    $(list).empty().append(html);
}

function createPlayerTable(side, players, pointScheme) {
    var table = $(side).attr("id") === "leftselect" ? "#leftplayertable" : "#rightplayertable";
    var html = "<tr><th></th>";
    for (var i = 0; i < pointScheme.length; i++) {
        html += "<th class='table-head' scope='col' style='text-align:center'>" + pointScheme[i] + "</th>";
    }
    html += "<th class='table-head' scope='col' style='text-align:center'>Totals</th>";
    html += "<th class='table-head' scope='col' style='text-align:center' width='75'>TUH</th>"
    html += "</tr>";
    for (var i = 0; i < players.length; i++) {
        html += "<tr class='player-body' data-player='" + players[i].id + "'>";
        if (i < game.maxActivePlayers) {
            html += "<th class='active-player'>" + players[i].name; + "</th>";
            for (var j = 0; j < pointScheme.length; j++) {
                html += "<td class='player-point active-player' data-player='" + players[i].id + "' data-point-value='" + pointScheme[j] + "'>0</td>";
            }
            html += "<td class='player-total active-player' data-player='" + players[i].id + "'>0</td>";
            html += "<td class='player-tossups td-scoresheet active-player' data-player='" + players[i].id + "' width='75'><input type='number' class='input-scoresheet' value='0' style='font-size:14px'/></td>";
            html += "</tr>";
        } else {
            html += "<th>" + players[i].name; + "</th>";
            for (var j = 0; j < pointScheme.length; j++) {
                html += "<td class='player-point' data-player='" + players[i].id + "' data-point-value='" + pointScheme[j] + "'>0</td>";
            }
            html += "<td class='player-total' data-player='" + players[i].id + "'>0</td>";
            html += "<td class='player-tossups td-scoresheet' data-player='" + players[i].id + "' width='75'><input type='number' class='input-scoresheet' value='0' style='font-size:14px'/></td>";
            html += "</tr>";
        }

    }
    $(table).empty().append(html);
}

function addPlayerTableRow(side, player, pointScheme) {
    var table = side == "left" ? "#leftplayertable" : "#rightplayertable";
    var html = "<tr class='player-body' data-player='" + player.id + "'>";
    html += "<th class='unactive-player'>" + player.name; + "</th>";
    for (var j = 0; j < pointScheme.length; j++) {
        html += "<td class='player-point' data-player='" + player.id + "' data-point-value='" + pointScheme[j] + "'>0</td>";
    }
    html += "<td class='player-total' data-player='" + player.id + "'>0</td>";
    html += "<td class='player-tossups td-scoresheet' data-player='" + player.id + "' width='75'><input type='number' class='input-scoresheet' value='0' style='font-size:14px'/></td>";
    html += "</tr>";
    $(table).append(html);
}

function setNegButtonPlayer(button, player) {
    $(button).attr("data-player", player);
}

function lockOutTeam(button) {
    $(button).parents(".player-list").find(":input").prop("disabled", true);
    $(button).parents(".player-list").next(".neg-box").fadeIn(50);
}

function unlockTeam(button) {
    $(button).parent().prev(".player-list").find(":input").prop("disabled", false);
    $(button).parent(".neg-box").fadeOut(50);
}

function unlockBothTeams() {
    $(".undo-neg").parent().prev(".player-list").find(":input").prop("disabled", false);
    $(".undo-neg").parent(".neg-box").fadeOut(50);
}

function showAnswersOnScoresheet(phase) {
    var row = phase.getNumber();
    var answers = phase.getTossup().getAnswers();
    for (var i = 0; i < answers.length; i++) {
        var td = $("td[data-player=" + answers[i].player + "][data-row=" + row + "]");
        $(td).text(answers[i].value);
    }
}

function showPlayerPointTotals(gameObj) {
    $(".player-table td").not(".player-tossups").text("0");
    var playerTotals = gameObj.getAllPlayerScores();
    for (var playerid in playerTotals) {
        if (playerTotals.hasOwnProperty(playerid)) {
            var tdTotal = $(".player-total[data-player=" + playerid + "]");
            var pointTotal = playerTotals[playerid]["total"];
            for (var pointValue in playerTotals[playerid]) {
                if (playerTotals[playerid].hasOwnProperty(pointValue) && pointValue !== "total") {
                    var td = $("td[data-player='" + playerid + "'][data-point-value='" + pointValue + "']");
                    $(td).text(playerTotals[playerid][pointValue]);
                }
            }
            $(tdTotal).text(pointTotal);
        }
    }
}

function revertPlayerAnswerOnScoresheet(answer, row) {
    $("#scoresheet-body tr td[data-row='" + row + "'][data-player='" + answer.player + "']").text("-");
    $(".total-td[data-row='" + row + "']").text("-");
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
}

function editAddBonusAttributes(team1, team2) {
    $("#left-bonus-info").text("+10 for " + team1.name);
    $("#right-bonus-info").text("+10 for " + team2.name);
    $("#left-gotten-bonus").attr("data-team", team1.id);
    $("#right-gotten-bonus").attr("data-team", team2.id);

    $(".left-team-bonus").text("+10 for " + team1.name).attr("data-team", team1.id);
    $(".right-team-bonus").text("+10 for " + team2.name).attr("data-team", team2.id);
}

function addPlayerColumn(side, player) {
    if (side == "right") {
        $("#scoresheet thead tr").append("<th class='player-header' data-toggle='tooltip' title='" + player.player_name + "'>" + player.player_name.slice(0, 2).toUpperCase() + "</th>");
        $("#scoresheet tbody tr").each(function(index, tableRow) {
            var row = index + 1;
            $(this).append("<td data-player='" + player._id + "' data-row='" + row + "'>-</td>");
        });
    } else {
        $("#scoresheet thead tr").prepend("<th class='player-header' data-toggle='tooltip' title='" + player.player_name + "'>" + player.player_name.slice(0, 2).toUpperCase() + "</th>");
        $("#scoresheet tbody tr").each(function(index, tableRow) {
            var row = index + 1;
            $(this).prepend("<td data-player='" + player._id + "' data-row='" + row + "'>-</td>");
        });
    }
    $('[data-toggle="tooltip"]').tooltip();
    var colspan = game.team1.players.length + game.team2.players.length + 5;
    changeFooterColSpan(colspan);
}

function changeFooterColSpan(colspan) {
    $("#tfoot-msg").attr("colspan", colspan);
}

function escapeHtml(string) {
    return String(string).replace(/[&<>"'\/]/g, function (s) {
         return entityMap[s];
    });
}
