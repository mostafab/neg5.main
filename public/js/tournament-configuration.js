$(document).ready(function() {

    $("#add-team-panel").click(function(e) {
        e.stopImmediatePropagation();
        $("#add-team-body").toggle(300);
    });

    $("#add-team-button").click(function(e) {
        sendTeamToServer();
        sendPlayersToServer();
    });
});

function sendTeamToServer() {
    $.ajax({
        url : "/home/tournaments/createteam",
        type : "POST",
        data : $("#teamform").serialize(),
        success : function(databack, status, xhr) {
            // console.log(databack);
        }
    });
}

function sendPlayersToServer() {
    $.ajax({
        url : "/home/tournaments/createplayers",
        type : "POST",
        data : $("#playersform").serialize(),
        success : function(databack, status, xhr) {
            // console.log(databack);
        }
    })
}
