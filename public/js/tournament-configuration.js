var nextPlayerNum = 5;

$(document).ready(function() {

    $("#add-team-panel").click(function(e) {
        e.stopImmediatePropagation();
        $("#add-team-body").toggle(300);
    });

    $("#add-team-button").click(function(e) {
        sendTeamToServer();
        sendPlayersToServer();
    });

    $("#team_name_input").keyup(function(e) {
        var teamname = $("#team_name_input").val().trim();
        $("#player_team_dynamic").val(teamname);
    });

    $("#newlineplayer").click(function(e) {
        createPlayerInputField();
    });
});

function sendTeamToServer() {
    $.ajax({
        url : "/home/tournaments/createteam",
        type : "POST",
        data : $("#teamform").serialize(),
        success : function(databack, status, xhr) {
            console.log("Success");
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
