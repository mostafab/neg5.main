'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MAX_TOSSUPS = 20;
var BONUS_POINT_VALUE = 10;
var CURRENT_BONUS = 1;

var entityMap = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': '&quot;',
    "'": '&#39;',
    "/": '&#x2F;'
};

var Player = function Player(name, id, teamid) {
    _classCallCheck(this, Player);

    this.name = name;
    this.id = id;
    this.teamid = teamid;
};

var Team = function Team(name, id) {
    _classCallCheck(this, Team);

    this.id = id;
    this.name = name;
    this.players = [];
};

var Answer = function Answer(team, player, value) {
    _classCallCheck(this, Answer);

    this.team = team;
    this.player = player;
    this.value = value;
};

var Tossup = (function () {
    function Tossup() {
        _classCallCheck(this, Tossup);

        this.answers = [];
    }

    _createClass(Tossup, [{
        key: "getAnswers",
        value: function getAnswers() {
            return this.answers;
        }
    }, {
        key: "addAnswer",
        value: function addAnswer(teamid, playerid, value) {
            this.answers.push(new Answer(teamid, playerid, value));
            // console.log(this.answers);
        }
    }, {
        key: "removeLastAnswer",
        value: function removeLastAnswer() {
            if (this.answers.length !== 0) {
                return this.answers.pop();
            }
            return null;
        }
    }]);

    return Tossup;
})();

var BonusPart = function BonusPart(number, gettingTeam) {
    _classCallCheck(this, BonusPart);

    this.number = number;
    this.gettingTeam = gettingTeam;
    this.value = 10;
};

var Bonus = (function () {
    function Bonus() {
        _classCallCheck(this, Bonus);

        this.forTeam = null;
        this.forTeamPoints = 0;
        this.againstTeamPoints = 0;
        // this.bonusParts = [];
    }

    _createClass(Bonus, [{
        key: "setForTeam",
        value: function setForTeam(teamid) {
            this.forTeam = teamid;
        }
    }, {
        key: "setForTeamPoints",
        value: function setForTeamPoints(points) {
            this.forTeamPoints = points;
        }
    }, {
        key: "setAgainstTeamPoints",
        value: function setAgainstTeamPoints(points) {
            this.againstTeamPoints = points;
        }
    }, {
        key: "getForTeam",
        value: function getForTeam() {
            return this.forTeam;
        }
    }, {
        key: "getForTeamPoints",
        value: function getForTeamPoints() {
            return this.forTeamPoints;
            // var points = 0;
            // for (var i = 0; i < this.bonusParts.length; i++) {
            //     if (this.bonusParts[i].gettingTeam == this.forTeam) {
            //         points += this.bonusParts[i].value;
            //     }
            // }
            // return points;
        }
    }, {
        key: "getAgainstTeamPoints",
        value: function getAgainstTeamPoints() {
            // var points = 0;
            // for (var i = 0; i < this.bonusParts.length; i++) {
            //     if (this.bonusParts[i].gettingTeam && this.bonusParts[i].gettingTeam != this.forTeam) {
            //         points += this.bonusParts[i].value;
            //     }
            // }
            // return points;
            return this.againstTeamPoints;
        }

        // addBonusPart(number, gettingTeam) {
        //     this.bonusParts.push(new BonusPart(number, gettingTeam));
        // }
    }]);

    return Bonus;
})();

var Phase = (function () {
    function Phase(number) {
        _classCallCheck(this, Phase);

        this.number = number;
        this.tossup = new Tossup();
        this.bonus = new Bonus();
    }

    _createClass(Phase, [{
        key: "getNumber",
        value: function getNumber() {
            return this.number;
        }
    }, {
        key: "getTossupPointsEarned",
        value: function getTossupPointsEarned(teamid) {
            var sum = 0;
            var answers = this.tossup.getAnswers();
            for (var i = 0; i < answers.length; i++) {
                if (answers[i].player.teamid == teamid) {
                    sum += answers[i].value;
                }
            }
            return sum;
        }
    }, {
        key: "getBonusPointsEarned",
        value: function getBonusPointsEarned(teamid) {
            return 0;
        }
    }, {
        key: "getBounceBackPoints",
        value: function getBounceBackPoints(teamid) {
            return 0;
        }
    }, {
        key: "getTossup",
        value: function getTossup() {
            return this.tossup;
        }
    }, {
        key: "getBonus",
        value: function getBonus() {
            return this.bonus;
        }
    }, {
        key: "addAnswerToTossup",
        value: function addAnswerToTossup(teamid, playerid, value) {
            this.tossup.addAnswer(teamid, playerid, value);
        }
    }, {
        key: "getBonusPointsForTeam",
        value: function getBonusPointsForTeam(teamid) {
            if (this.bonus.getForTeam() == teamid) {
                return this.bonus.getForTeamPoints();
            } else {
                return this.bonus.getAgainstTeamPoints();
            }
        }
    }, {
        key: "addBonusPoints",
        value: function addBonusPoints(forTeamID, forTeamPoints, otherTeamPoints) {
            this.bonus.setForTeam(forTeamID);
            this.bonus.setForTeamPoints(forTeamPoints);
            this.bonus.setAgainstTeamPoints(otherTeamPoints);
        }
    }, {
        key: "removeLastTossup",
        value: function removeLastTossup() {
            return this.tossup.removeLastAnswer();
        }
    }]);

    return Phase;
})();

var Game = (function () {
    function Game() {
        _classCallCheck(this, Game);

        this.team1 = null;
        this.team2 = null;
        this.phases = [];
        this.currentPhase = new Phase(1);
    }

    _createClass(Game, [{
        key: "getPhases",
        value: function getPhases() {
            return this.phases;
        }
    }, {
        key: "getCurrentPhase",
        value: function getCurrentPhase() {
            return this.currentPhase;
        }
    }, {
        key: "deadTossup",
        value: function deadTossup() {
            this.stashPhase();
        }
    }, {
        key: "nextPhase",
        value: function nextPhase() {
            var nextPhaseNum = this.currentPhase.getNumber() + 1;
            if (nextPhaseNum > this.phases.length) {
                this.currentPhase = new Phase(nextPhaseNum);
            } else {
                this.currentPhase = this.phases[nextPhaseNum - 1];
            }
        }
    }, {
        key: "stashPhase",
        value: function stashPhase() {
            // console.log("Stashing phase");
            // console.log(this.currentPhase);
            if (this.phases.length < this.currentPhase.getNumber()) {
                this.phases.push(this.currentPhase);
            } else {
                this.phases[this.currentPhase.getNumber() - 1] = this.currentPhase;
            }
            // console.log(this.phases);
            this.nextPhase();
        }
    }, {
        key: "setTeam",
        value: function setTeam(number, name, id, players) {
            if (number == 1) {
                this.team1 = new Team(name, id);
                for (var i = 0; i < players.length; i++) {
                    this.team1.players.push(new Player(players[i].player_name, players[i]._id, players[i].teamID));
                }
                // console.log("sorting");
                this.team1.players.sort(function (player1, player2) {
                    return player1.name.localeCompare(player2.name);
                });
            } else {
                this.team2 = new Team(name, id);
                for (var i = 0; i < players.length; i++) {
                    this.team2.players.push(new Player(players[i].player_name, players[i]._id, players[i].teamID));
                }
                this.team2.players.sort(function (player1, player2) {
                    return player1.name.localeCompare(player2.name);
                });
            }
        }
    }, {
        key: "addPlayer",
        value: function addPlayer(name, id, teamid) {
            var player = new Player(name, id, teamid);
            if (teamid == this.team1.id) {
                this.team1.players.push(player);
                // console.log("Adding player");
            } else {
                    this.team2.players.push(player);
                }
        }
    }, {
        key: "addAnswerToTossup",
        value: function addAnswerToTossup(teamid, playerid, value) {
            this.currentPhase.addAnswerToTossup(teamid, playerid, value);
        }
    }, {
        key: "getPlayersPointValues",
        value: function getPlayersPointValues(team) {
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
    }, {
        key: "getAllPlayerScores",
        value: function getAllPlayerScores() {
            var playerScores = {};
            var allPlayers = this.team1.players.concat(this.team2.players);
            for (var i = 0; i < allPlayers.length; i++) {
                playerScores[allPlayers[i].id] = { total: 0 };
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
    }, {
        key: "getPlayerScore",
        value: function getPlayerScore(player) {
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
    }, {
        key: "getTeamScore",
        value: function getTeamScore(teamid) {
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
    }, {
        key: "getTeamBouncebacks",
        value: function getTeamBouncebacks(teamid) {
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
    }, {
        key: "getTeamScoreUpToPhase",
        value: function getTeamScoreUpToPhase(teamid, maxPhase) {
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
    }]);

    return Game;
})();

var game = new Game();

$(document).ready(function () {

    $("#game-metadata").hide(0);

    $(".teamselect").change(function () {
        findPlayers($(this));
    });

    $("body").on("click", ".btn-point", function () {
        if (game.team1 != null && game.team2 != null) {
            game.getCurrentPhase().addAnswerToTossup($(this).attr("data-team"), $(this).attr("data-player"), parseFloat($(this).attr("data-point-value")));
            showAnswersOnScoresheet(game.currentPhase);
            // console.log(game.getTeamScore(game.team1.id) + ", " + game.getTeamScore(game.team2.id));
            showTotalOnScoresheetOneRow(game.getCurrentPhase().getNumber(), $(this).attr("data-team"), game.getTeamScore($(this).attr("data-team")));
            // console.log(game.getCurrentPhase());
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
            } else {
                setNegButtonPlayer($(this).parent(".player-list").next(".neg-box").find(".undo-neg"), $(this).attr("data-player"));
                lockOutTeam($(this));
            }
            showPlayerPointTotals(game);
        }
    });

    $("body").on("click", "#next-tossup", function () {
        if (game.team1 !== null && game.team2 !== null)
            // console.log("Going to next tossup");
            var bonusLeft = $("#left-gotten-bonus li").size() * BONUS_POINT_VALUE;
        var bonusRight = $("#right-gotten-bonus li").size() * BONUS_POINT_VALUE;
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
        // console.log(game.getCurrentPhase());
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
        unlockBothTeams();
        incrementTossupsHeardForPlayers();
    });

    $("body").on("click", ".remove-bonus", function () {
        console.log("Removing bonus");
        $(this).parent().remove();
    });

    $("body").on("click", "#dead-tossup", function () {
        console.log("dead tossup");
        if (game.team1 !== null && game.team2 !== null) {
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
            unlockBothTeams();
            incrementTossupsHeardForPlayers();
        }
    });

    $("body").on("click", "#submit-game", function () {
        var parsedGame = parseScoresheet(game);
        // console.log(scoresheet);
        $(this).prop("disabled", true);
        submitScoresheet(game, parsedGame);
    });

    $("body").on("click", ".add-player-button", function () {
        $(this).prev(".player-name-input").css("border-color", "transparent");
        if ($(this).prev(".player-name-input").val().length !== 0) {
            $(this).prop("disabled", true);
            addPlayer(escapeHtml($(this).prev(".player-name-input").val()), $(this).attr("data-team"), $(this).attr("data-team-name"), $(this).attr("side"));
        } else {
            $(this).prev(".player-name-input").css("border-color", "red");
        }
    });

    $("body").on("click", "#undo-tossup", function () {
        var lastAnswer = game.getCurrentPhase().removeLastTossup();
        revertPlayerAnswerOnScoresheet(lastAnswer, game.getCurrentPhase().getNumber());
        showTotalOnScoresheetOneRow(game.getCurrentPhase().getNumber(), lastAnswer.team, game.getTeamScore(lastAnswer.team));
        destroyBonusLabels();
        showTossupDiv();
        showPlayerPointTotals(game);
    });

    $("body").on("click", "#scoresheet-body td", function () {
        // console.log($(this).attr("data-player"));
    });

    $('body').ajaxStart(function () {
        $(this).css({ 'cursor': 'wait' });
    }).ajaxStop(function () {
        $(this).css({ 'cursor': 'default' });
    });

    $("#lock-teams").click(function () {
        $("#team-select-div").slideUp("fast");
        $("#lock-teams-div").slideUp("fast");
    });

    $(".add-bonus").click(function () {
        var list = $(this).attr("data-list");
        addBonusRow(list);
    });

    $(".undo-neg").click(function () {
        var lastAnswer = game.getCurrentPhase().removeLastTossup();
        revertPlayerAnswerOnScoresheet(lastAnswer, game.getCurrentPhase().getNumber());
        showTotalOnScoresheetOneRow(game.getCurrentPhase().getNumber(), lastAnswer.team, game.getTeamScore(lastAnswer.team));
        unlockTeam($(this));
        showPlayerPointTotals(game);
    });

    $("body").on("click", ".player-table .player-body", function (e) {
        // console.log("toggling class...");
        if (!$(e.target).is("input")) {
            // console.log($(this).attr("data-player"));
            $(this).find("th").toggleClass("active-player");
            $(this).find("td").toggleClass("active-player");
            var playerid = $(this).attr("data-player");
            $(".player-list > .cell[data-player='" + playerid + "']").toggleClass("active-player");
        }
    });

    $("#undo-game").click(function () {
        $(this).prop("disabled", true);
        undoGameSubmission($(this).attr("data-tournament"), $(this).attr("data-game"));
    });
});

function findPlayers(side) {
    // console.log(game);
    $.ajax({
        url: "/tournaments/getplayers",
        type: "GET",
        data: { tournamentid: $("#tournamentid").val(),
            teamname: $(side).val() },
        success: function success(databack, status, xhr) {
            changeTeamLabels(side);
            var pointValues = Object.keys(databack.pointScheme);
            // createPlayerLabels(side, databack.players, pointValues, databack.pointTypes);
            if ($(side).attr("id") == "leftselect") {
                game.setTeam(1, $("#leftselect").find(":selected").text(), $("#leftselect").val(), databack.players);
                console.log(game.team1.players);
                createPlayerTable(side, game.team1.players, pointValues);
                createPlayerLabels(side, game.team1.players, pointValues, databack.pointTypes);
            } else {
                game.setTeam(2, $("#rightselect").find(":selected").text(), $("#rightselect").val(), databack.players);
                createPlayerTable(side, game.team2.players, pointValues);
                createPlayerLabels(side, game.team2.players, pointValues, databack.pointTypes);
            }
            if (game.team1 !== null && game.team2 !== null) {
                $("#game-metadata").slideDown(0);
                createScoresheet(game.team1, game.team2);
                editAddBonusAttributes(game.team1, game.team2);
                createDeadTossupButton();
                createSubmitGameButton();
            }
        }
    });
}

function addPlayer(playerName, teamid, teamName, side) {
    var data = {
        tournamentidform: $("#tournamentid").val(),
        teamnameform: teamName,
        teamidform: teamid,
        newplayername: playerName
    };
    $.ajax({
        url: "/tournaments/players/create",
        type: "POST",
        data: data,
        success: function success(databack, status, xhr) {
            // console.log(databack);
            var pointScheme = Object.keys(databack.pointScheme);
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
        complete: function complete(xhr, status) {
            $(".add-player-button").prop("disabled", false);
        }
    });
}

function submitScoresheet(game, parsedScoresheet) {
    var data = {
        "tournamentid": $("#tournamentid").val(),
        "scoresheet": game,
        "game": parsedScoresheet
    };
    $.ajax({
        url: "/tournaments/scoresheet/submit",
        type: "POST",
        data: data,
        success: function success(databack, status, xhr) {
            // console.log(xhr);
            $("#dead-tossup-div").slideUp(400);
            $("#submit-game-div").slideUp(400);
            setGameAnchorTag(databack.gameid);
            $("#goto-game-div").slideDown(400);
            $("#submit-game").prop("disabled", false);
        }
    });
}

function undoGameSubmission(tournament, game) {
    $.ajax({
        url: "/tournaments/games/remove",
        type: "POST",
        data: {
            gameid_form: game,
            tournament_idgame: tournament
        },
        success: function success(databack, status, xhr) {
            // console.log(databack);
            $("#dead-tossup-div").slideDown(400);
            $("#submit-game-div").slideDown(400);
            $("#goto-game-div").slideUp(400);
            $("#undo-game").prop("disabled", false);
        }
    });
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
    gameToAdd.team1.team_name = submittedGame.team1.name;
    gameToAdd.team1.score = submittedGame.getTeamScore(submittedGame.team1.id);
    gameToAdd.team1.bouncebacks = submittedGame.getTeamBouncebacks(submittedGame.team1.id);
    gameToAdd.team1.playerStats = submittedGame.getPlayersPointValues(submittedGame.team1);
    gameToAdd.team2.team_id = submittedGame.team2.id;
    gameToAdd.team2.team_name = submittedGame.team2.name;
    gameToAdd.team2.score = submittedGame.getTeamScore(submittedGame.team2.id);
    gameToAdd.team2.bouncebacks = submittedGame.getTeamBouncebacks(submittedGame.team2.id);
    gameToAdd.team2.playerStats = submittedGame.getPlayersPointValues(submittedGame.team2);
    gameToAdd.round = $("#round-number").val();
    gameToAdd.tossupsheard = submittedGame.getPhases().length;
    gameToAdd.room = $("#room-number").val();
    gameToAdd.moderator = $("#moderator").val();
    gameToAdd.packet = $("#packet").val();
    gameToAdd.notes = $("#notes").val();

    for (var playerid in gameToAdd.team1.playerStats) {
        if (gameToAdd.team1.playerStats.hasOwnProperty(playerid)) {
            if (gameToAdd.tossupsheard !== 0) {
                // console.log(findTossupsHeardForPlayer(playerid));
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

function incrementTossupsHeardForPlayers() {
    console.log("Incrementing tossups heard...");
    $(".player-table .active-player input").each(function (index, input) {
        var currentTUH = parseFloat($(input).val());
        $(input).val(currentTUH + 1 + "");
    });
}

function createDeadTossupButton() {
    var html = "<button type='button' class='btn btn-md btn-block' id='dead-tossup'> Dead Tossup </button>";
    $("#dead-tossup-div").empty().append(html);
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
        html += "<th class='player-header' title='" + team1.players[i].name + "'>" + team1.players[i].name.slice(0, 2).toUpperCase() + "</th>";
    }
    html += "<th>Bonus</th><th>Total</th>";
    html += "<th class='alert alert-info'> TU # </th>";
    html += "<th>Total</th><th>Bonus</th>";
    for (var i = 0; i < team2.players.length; i++) {
        html += "<th class='player-header' title='" + team2.players[i].name + "'>" + team2.players[i].name.slice(0, 2).toUpperCase() + "</th>";
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
    $(html).hide().appendTo("#scoresheet").fadeIn(500);
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
    // console.log(pointValues);
    var html = "<div class='row cell' data-player='" + player._id + "'>";
    html += "<div class='col-md-5'>";
    html += "<div class='playerbox'><strong style='color:white'>" + player.player_name + "</strong></div></div>";
    html += "<div class='col-md-7'>";
    html += "<div class='row'>";
    for (var j = 0; j < pointValues.length; j++) {
        if (pointTypes[pointValues[j]] === "N") {
            html += "<button" + " data-team='" + player.teamID + "' data-neg='true' data-point-value='" + pointValues[j] + "' data-player='" + player._id + "' class='btn btn-md btn-danger btn-point'>" + pointValues[j] + "</button>";
        } else if (pointTypes[pointValues[j]] === "P") {
            html += "<button" + " data-team='" + player.teamID + "' data-neg='false' data-point-value='" + pointValues[j] + "' data-player='" + player._id + "' class='btn btn-md btn-success btn-point'>" + pointValues[j] + "</button>";
        } else {
            html += "<button" + " data-team='" + player.teamID + "' data-neg='false' data-point-value='" + pointValues[j] + "' data-player='" + player._id + "' class='btn btn-md btn-info btn-point'>" + pointValues[j] + "</button>";
        }
    }
    html += "</div>";
    html += "</div>";
    html += "</div>";
    if ($(side + " .cell").size() === 0) {
        $(side).prepend(html);
        // console.log("No players before");
    } else {
            // console.log("Players before");
            $(html).insertAfter($(side + " .cell").last());
        }
}

function createPlayerLabels(side, players, pointValues, pointTypes) {
    var list = $(side).attr("id") === "leftselect" ? "#leftplayerlist" : "#rightplayerlist";
    var html = "";
    for (var i = 0; i < players.length; i++) {
        html += "<div class='row cell' data-player='" + players[i].id + "'>";
        html += "<div class='col-md-5'>";
        html += "<div class='playerbox'><strong style='color:white'>" + players[i].name + "</strong></div></div>";
        html += "<div class='col-md-7'>";
        html += "<div class='row'>";
        for (var j = 0; j < pointValues.length; j++) {
            if (pointTypes[pointValues[j]] === "N") {
                html += "<button" + " data-team='" + players[i].teamid + "' data-neg='true' data-point-value='" + pointValues[j] + "' data-player='" + players[i].id + "' class='btn btn-md btn-danger btn-point'>" + pointValues[j] + "</button>";
            } else if (pointTypes[pointValues[j]] === "P") {
                html += "<button" + " data-team='" + players[i].teamid + "' data-neg='false' data-point-value='" + pointValues[j] + "' data-player='" + players[i].id + "' class='btn btn-md btn-success btn-point'>" + pointValues[j] + "</button>";
            } else {
                html += "<button" + " data-team='" + players[i].teamid + "' data-neg='false' data-point-value='" + pointValues[j] + "' data-player='" + players[i].id + "' class='btn btn-md btn-info btn-point'>" + pointValues[j] + "</button>";
            }
        }
        html += "</div>";
        html += "</div>";
        html += "</div>";
    }
    var teamid = $(side).val();
    var teamname = $(side).find(":selected").text();
    html += "<br><input type='text' class='form-control player-name-input' placeholder='New Player'/><button class='btn btn-md btn-success add-player-button' data-team='" + teamid + "' data-team-name='" + teamname + "'> Add a Player </button>";
    $(list).empty().append(html);
}

function createPlayerTable(side, players, pointScheme) {
    var table = $(side).attr("id") === "leftselect" ? "#leftplayertable" : "#rightplayertable";
    var html = "<tr><th></th>";
    for (var i = 0; i < pointScheme.length; i++) {
        html += "<th class='table-head' scope='col' style='text-align:center'>" + pointScheme[i] + "</th>";
    }
    html += "<th class='table-head' scope='col' style='text-align:center'>Totals</th>";
    html += "<th class='table-head' scope='col' style='text-align:center' width='75'>TUH</th>";
    html += "</tr>";
    for (var i = 0; i < players.length; i++) {
        html += "<tr class='player-body' data-player='" + players[i].id + "'>";
        html += "<th>" + players[i].name;+"</th>";
        for (var j = 0; j < pointScheme.length; j++) {
            html += "<td class='player-point' data-player='" + players[i].id + "' data-point-value='" + pointScheme[j] + "'>0</td>";
        }
        html += "<td class='player-total' data-player='" + players[i].id + "'>0</td>";
        html += "<td class='player-tossups td-scoresheet' data-player='" + players[i].id + "' width='75'><input type='number' class='input-scoresheet' value='0' style='font-size:14px'/></td>";
        html += "</tr>";
    }
    $(table).empty().append(html);
}

function addPlayerTableRow(side, player, pointScheme) {
    // console.log(player);
    var table = side == "left" ? "#leftplayertable" : "#rightplayertable";
    var html = "<tr class='player-body' data-player='" + player.id + "'>";
    html += "<th class='unactive-player'>" + player.name;+"</th>";
    for (var j = 0; j < pointScheme.length; j++) {
        html += "<td class='player-point' data-player='" + player.id + "' data-point-value='" + pointScheme[j] + "'>0</td>";
    }
    html += "<td class='player-total' data-player='" + player.id + "'>0</td>";
    html += "<td class='player-tossups td-scoresheet' data-player='" + player.id + "' width='75'><input type='number' class='input-scoresheet' value='0' style='font-size:14px'/></td>";
    html += "</tr>";
    $(table).append(html);
}

function setNegButtonPlayer(button, player) {
    // console.log(button);
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
    // console.log(phase.getNumber());
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
    // console.log(playerTotals);
}

function revertPlayerAnswerOnScoresheet(answer, row) {
    $("#scoresheet-body tr td[data-row='" + row + "'][data-player='" + answer.player + "']").text("-");
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
    // console.log($(list + " .list-group-item").size());
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
        $("#scoresheet tbody tr").each(function (index, tableRow) {
            var row = index + 1;
            $(this).append("<td data-player='" + player._id + "' data-row='" + row + "'>-</td>");
        });
    } else {
        $("#scoresheet thead tr").prepend("<th class='player-header' title='" + player.player_name + "'>" + player.player_name.slice(0, 2).toUpperCase() + "</th>");
        $("#scoresheet tbody tr").each(function (index, tableRow) {
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

function escapeHtml(string) {
    return String(string).replace(/[&<>"'\/]/g, function (s) {
        return entityMap[s];
    });
}
