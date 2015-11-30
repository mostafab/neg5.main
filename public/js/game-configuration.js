$(document).ready(function() {

    $("#entergamebutton").click(function(e) {
        // console.log($("#changegameform").serialize());
        editGame();
    });

    $("#editteambutton").click(function(e) {
        editTeam();
    });
});


function editGame() {
    $.ajax({
        url : "/home/tournaments/games/edit",
        type : "POST",
        data : $("#changegameform").serialize(),
        success : function(databack, status, xhr) {
            console.log(databack);
            console.log("Edited game successfully");
            $("#oldgameid_input").val(databack.shortID);
        }
    });
}

function editTeam() {
    $.ajax({
        url : "/home/tournaments/teams/edit",
        type : "POST",
        data : $("#teamdetailsform").serialize(),
        success : function(databack, status, xhr) {
            console.log(databack.team);
        }
    });
}
