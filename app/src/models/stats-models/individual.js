'use strict';

import db from '../../data-access/stats';

export class PlayerStatsReport {

    constructor(tournamentId, phaseId) {
        this.tournamentId = tournamentId;
        this.phaseId = phaseId;
    }

    getReport() {
        return new Promise((resolve, reject) => {
            db.individualReport(this.tournamentId, this.phaseId)
                .then(result => resolve(result))
                .catch(error => reject(error));
        })
    }

}