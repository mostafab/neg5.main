'use strict';

import db from '../../data-access/stats';
import matchManager from './../model-managers/match';
import teamManager from './../model-managers/team';
import tournamentManager from './../model-managers/tournament';
import StatReportType from './../../enums/stat-report-type';
import statReportMapper from './../../mappers/stat-report-mapper';

import StatsInternalClient from './../../client/stats-client';

export class StatsReportManager {

    constructor(tournamentId) {
        this.tournamentId = tournamentId;
        this.statsClient = new StatsInternalClient();
    }

    async fetchReport(phaseId = null, reportType) {
        console.log(reportType);
        try {
            return statReportMapper(await db.fetchReport(this.tournamentId, phaseId, reportType));
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
                .then(result => {
                    resolve(result);
                    this.addOrUpdate(phaseId, StatReportType.TEAM, result); 
                })
                .catch(error => reject(error));
        })
    }

    generateAndSaveIndividualReport(phaseId = null) {
        return new Promise((resolve, reject) => {
            db.generateIndividualReport(this.tournamentId, phaseId)
                .then(result => {
                    resolve(result);
                    this.addOrUpdate(phaseId, StatReportType.INDIVIDUAL, result);
                })
                .catch(error =>{console.log(error); reject(error)});
        })
    }

    generateAndSaveTeamFullReport(phaseId = null) {
        return new Promise((resolve, reject) => {
            db.generateTeamFullReport(this.tournamentId, phaseId)
                .then(async result => {
                    resolve(result);
                    this.addOrUpdate(phaseId, StatReportType.TEAM_FULL, result);
                })
                .catch(error => reject(error));
        })
    }

    generateAndSavePlayerFullReport(phaseId = null) {
        return new Promise((resolve, reject) => {
            db.generatePlayerFullReport(this.tournamentId, phaseId)
                .then(result => {
                    resolve(result);
                    this.addOrUpdate(phaseId, StatReportType.INDIVIDUAL_FULL, result);
                })
                .catch(error => reject(error));
        })
    }

    generateAndSaveRoundReport(phaseId = null) {
        return new Promise((resolve, reject) => {
            db.generateRoundReport(this.tournamentId, phaseId)
                .then(result => {
                    resolve(result);
                    this.addOrUpdate(phaseId, StatReportType.ROUND_REPORT, result);
                })
                .catch(error => reject(error));
        })
    }

    async getFullIndividualStats(phaseId = null) {
        const matches = await matchManager.findAllForStats(this.tournamentId);
        const teams = await teamManager.findForStats(this.tournamentId);
        const tournamentInfo = await tournamentManager.findById(this.tournamentId);
        return await this.statsClient.getFullIndividualStats(this.tournamentId, {
            phaseId,
            matches,
            teams,
            tossupValues: tournamentInfo.tournament.tossup_point_scheme,
        });
    }

}