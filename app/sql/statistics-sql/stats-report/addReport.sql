INSERT INTO tournament_stat_report(tournament_id, phase_id, report_type, statistics)
VALUES (${tournamentId}, ${phaseId}, ${reportType}, ${stats})
RETURNING *;
