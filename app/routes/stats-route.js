var mongoose = require("mongoose");
var Tournament = mongoose.model("Tournament");
var statsController = require("../../app/controllers/stats-controller");

module.exports = function(app) {

    app.get("/home/tournaments/:tid/stats/qteam", function(req, res, next) {
        statsController.getTeamsInfo(req.params.tid, function(err, tournament, teamInfo) {
            if (err) {
                res.send(err);
            } else {
                if (teamInfo.length == 0) {
                    res.render("quick-teams", {teamInfo : teamInfo, tournament : tournament, headers : [], pointTypes : []});
                } else {
                    var headers = Object.keys(teamInfo[0]);
                    var pointTypes = Object.keys(teamInfo[0].pointTotals);
                    res.render("quick-teams", {teamInfo : teamInfo, tournament : tournament, headers : headers, pointTypes : pointTypes});
                }
            }
        });
    });

    app.get("/home/tournaments/:tid/stats/qplayer", function(req, res, next) {
        statsController.getPlayersInfo(req.params.tid, function(err, tournament, playersInfo) {
            if (err) {
                res.send(err);
            } else {
                if (playersInfo.length == 0) {
                    res.render("quick-players", {playersInfo : playersInfo, tournament : tournament, headers : [], pointTypes : []});
                } else {
                    var headers = Object.keys(playersInfo[0]);
                    var pointTypes = Object.keys(playersInfo[0].pointTotals);
                    res.render("quick-players", {playersInfo : playersInfo, tournament : tournament, headers : headers, pointTypes : pointTypes});
                }
            }
        });
    });

    app.get("*", function(req, res, next) {
        res.status(404).send("Can't find this page");
    });
};
