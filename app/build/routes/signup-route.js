// 'use strict';

// const signupController = require('../../app/controllers/registration-controller');
// const tournamentController = require("../../app/controllers/tournament-controller");

// module.exports = app => {

//     app.get("/registrations", (req, res) => {
//         if (!req.session.director) {
//             res.redirect("/");
//         } else {
//             signupController.findDirectorRegistrations(req.session.director, (err, registrations) => {
//                 if (err) {
//                     res.status(500).end();
//                 } else {
//                     res.render("registration/registrations", {tournamentd : req.session.director, registrations : registrations});
//                 }
//             });
//         }
//     });

//     app.get("/t/:tid/signup", (req, res) => {
//         tournamentController.findTournamentById(req.params.tid, (err, result) => {
//             if (err) {
//                 res.status(500).send(err);
//             } else if (!result) {
//                 res.status(404).render("index/not-found", {tournamentd : req.session.director, msg : "That tournament doesn't exist."});
//             } else {
//                 if (!req.session.director) {
//                     res.render("registration/signup", {tournament : result, tournamentd : null});
//                 } else {
//                     signupController.findOneRegistration(result.shortID, req.session.director._id, (err, registration) => {
//                         if (err) {
//                             res.status(500).end();
//                         } else {
//                             res.render("registration/signup", {tournament : result, tournamentd : req.session.director, prevReg : registration});
//                         }
//                     });
//                 }
//             }
//         });
//     });

//     app.post("/t/:tid/signup/submit", (req, res) => {
//         const directorid = req.session.director == null ? null : req.session.director._id;
//         const tournamentid = req.params.tid;
//         signupController.createRegistration(tournamentid, directorid, req.body, (err, closed) => {
//             if (err) {
//                 res.status(500).end();
//             } else {
//                 res.status(200).send({err : null, closed : closed});
//             }
//         });
//     });

//     app.post("/signup/delete", (req, res) => {
//         if (!req.session.director) {
//             res.status(401).end();
//         } else {
//             signupController.removeRegistration(req.body.regid, err => {
//                 if (err) {
//                     res.status(500).end();
//                 } else {
//                     res.status(200).end();
//                 }
//             });
//         }
//     });
// };
"use strict";