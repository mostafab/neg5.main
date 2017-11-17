'use strict';

import db from '../../data-access/stats';
import StatReportType from './../../enums/stat-report-type';

export class StatsReportManager {

    constructor(tournamentId) {
        this.tournamentId = tournamentId;
    }

    async fetchReport(phaseId = null, reportType) {
        try {
            return await db.fetchReport(this.tournamentId, phaseId, reportType);
        } catch (err) {
            throw err;
        }
    }

    async addOrUpdate(phaseId = null, reportType, statistics) {
        let reportAlreadyExists = false;
        try {
            await db.fetchReport(this.tournamentId, phaseId, reportType);
            reportAlreadyExists = true;
        } catch (err) {
            if (err.name !== 'ReferenceError') {
                throw err;
            }
        }
        let result;
        if (reportAlreadyExists) {
            result = await db.update(this.tournamentId, phaseId, reportType, statistics);
        } else {
            result = await db.add(this.tournamentId, phaseId, reportType, statistics);
        }
        return result;
    }

    async add(phaseId = null, reportType, statistics) {
        try {
            return await db.add(this.tournamentId, phaseId, reportType, statistics);
        } catch (err) {
            throw err;
        }
    }

    async update(phaseId = null, reportType, statistics) {
        try {
            return await db.update(this.tournamentId, phaseId, reportType, statistics);
        } catch (err) {
            throw err;
        }
    }

    generateTeamReport(phaseId = null) {
        return new Promise((resolve, reject) => {
            db.generateTeamReport(this.tournamentId, phaseId)
                .then(result => {
                    resolve(result);
                    this.addOrUpdate(phaseId, StatReportType.TEAM, result);
                })
                .catch(error => reject(error));
        })
    }

    generateIndividualReport(phaseId = null) {
        return new Promise((resolve, reject) => {
            db.generateIndividualReport(this.tournamentId, phaseId)
                .then(result => {
                    resolve(result);
                    this.addOrUpdate(phaseId, StatReportType.INDIVIDUAL, result);
                })
                .catch(error => reject(error));
        })
    }

    generateTeamFullReport(phaseId = null) {
        return new Promise((resolve, reject) => {
            db.generateTeamFullReport(this.tournamentId, phaseId)
                .then(result => {
                    resolve(result);
                    this.addOrUpdate(phaseId, StatReportType.TEAM_FULL, result);
                })
                .catch(error => reject(error));
        })
    }

    generatePlayerFullReport(phaseId = null) {
        return new Promise((resolve, reject) => {
            db.generatePlayerFullReport(this.tournamentId, phaseId)
                .then(result => {
                    resolve(result);
                    this.addOrUpdate(phaseId, StatReportType.INDIVIDUAL_FULL, result);
                })
                .catch(error => reject(error));
        })
    }

    generateRoundReport(phaseId = null) {
        return new Promise((resolve, reject) => {
            db.generateRoundReport(this.tournamentId, phaseId)
                .then(result => {
                    resolve(result);
                    this.addOrUpdate(phaseId, StatReportType.ROUND_REPORT, result);
                })
                .catch(error => reject(error));
        })
    }

}