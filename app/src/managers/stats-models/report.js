'use strict';

import db from '../../data-access/stats';
import StatReportType from './../../enums/stat-report-type';
import statReportMapper from './../../mappers/stat-report-mapper';

export class StatsReportManager {

    constructor(tournamentId) {
        this.tournamentId = tournamentId;
    }

    async fetchReport(phaseId = null, reportType) {
        try {
            return statReportMapper(await db.fetchReport(this.tournamentId, phaseId, reportType));
        } catch (err) {
            throw err;
        }
    }

    async addOrUpdate(phaseId = null, reportType, statistics) {
        let reportAlreadyExists = false;
        console.log(`Attempting to add or update ${reportType} for phase ${phaseId}`);
        try {
            await db.fetchReport(this.tournamentId, phaseId, reportType);
            console.log(`report already exists for ${phaseId} of report type ${reportType}`);
            reportAlreadyExists = true;
        } catch (err) {
            if (err.name !== 'ReferenceError') {
                throw err;
            }
            console.log(`no existing row for ${phaseId} of report type ${reportType}`)
        }
        let result;
        if (reportAlreadyExists) {
            console.log('Updating existng report');
            result = await db.update(this.tournamentId, phaseId, reportType, statistics);
        } else {
            console.log('adding stats report');
            result = await db.add(this.tournamentId, phaseId, reportType, statistics);
        }
        return statReportMapper(result);
    }

    async add(phaseId = null, reportType, statistics) {
        try {
            return statReportMapper(await db.add(this.tournamentId, phaseId, reportType, statistics));
        } catch (err) {
            throw err;
        }
    }

    async update(phaseId = null, reportType, statistics) {
        try {
            return statReportMapper(await db.update(this.tournamentId, phaseId, reportType, statistics));
        } catch (err) {
            throw err;
        }
    }

    generateAndSaveTeamReport(phaseId = null) {
        return new Promise((resolve, reject) => {
            db.generateTeamReport(this.tournamentId, phaseId)
                .then(async result => {
                    const stats = await this.addOrUpdate(phaseId, StatReportType.TEAM, result);
                    resolve(stats);
                })
                .catch(error => reject(error));
        })
    }

    generateAndSaveIndividualReport(phaseId = null) {
        return new Promise((resolve, reject) => {
            db.generateIndividualReport(this.tournamentId, phaseId)
                .then(async result => {
                    const stats = await this.addOrUpdate(phaseId, StatReportType.INDIVIDUAL, result);
                    resolve(stats);
                })
                .catch(error =>{console.log(error); reject(error)});
        })
    }

    generateAndSaveTeamFullReport(phaseId = null) {
        return new Promise((resolve, reject) => {
            db.generateTeamFullReport(this.tournamentId, phaseId)
                .then(async result => {
                    const stats = await this.addOrUpdate(phaseId, StatReportType.TEAM_FULL, result);
                    resolve(stats);
                })
                .catch(error => reject(error));
        })
    }

    generateAndSavePlayerFullReport(phaseId = null) {
        return new Promise((resolve, reject) => {
            db.generatePlayerFullReport(this.tournamentId, phaseId)
                .then(async result => {
                    const stats = await this.addOrUpdate(phaseId, StatReportType.INDIVIDUAL_FULL, result);
                    resolve(stats);
                })
                .catch(error => reject(error));
        })
    }

    generateAndSaveRoundReport(phaseId = null) {
        return new Promise((resolve, reject) => {
            db.generateRoundReport(this.tournamentId, phaseId)
                .then(async result => {
                    const stats = await this.addOrUpdate(phaseId, StatReportType.ROUND_REPORT, result);
                    resolve(stats);
                })
                .catch(error => reject(error));
        })
    }

}