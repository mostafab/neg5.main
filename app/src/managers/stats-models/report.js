'use strict';

import db from '../../data-access/stats';

export class StatsReport {

    constructor(tournamentId) {
        this.tournamentId = tournamentId;
    }

    generateTeamReport(phaseId) {
        return new Promise((resolve, reject) => {
            db.generateTeamReport(this.tournamentId, phaseId)
                .then(result => resolve(result))
                .catch(error => reject(error));
        })
    }

    generateIndividualReport(phaseId) {
        return new Promise((resolve, reject) => {
            db.generateIndividualReport(this.tournamentId, phaseId)
                .then(result => resolve(result))
                .catch(error => reject(error));
        })
    }

    generateTeamFullReport(phaseId) {
        return new Promise((resolve, reject) => {
            db.generateTeamFullReport(this.tournamentId, phaseId)
                .then(result => resolve(result))
                .catch(error => reject(error));
        })
    }

    generatePlayerFullReport(phaseId) {
        return new Promise((resolve, reject) => {
            db.generatePlayerFullReport(this.tournamentId, phaseId)
                .then(result => resolve(result))
                .catch(error => reject(error));
        })
    }

    generateRoundReport(phaseId) {
        return new Promise((resolve, reject) => {
            db.generateRoundReport(this.tournamentId, phaseId)
                .then(result => resolve(result))
                .catch(error => reject(error));
        })
    }

}