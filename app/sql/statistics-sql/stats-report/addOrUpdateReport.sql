INSERT INTO tournament_stat_report(tournament_id, phase_id, report_type, statistics)
VALUES (${tournamentId}, ${phaseId}, ${reportType}, ${stats})
ON CONFLICT(tournament_id, phase_id, report_type) DO UPDATE
SET statistics = ${stats}, last_updated_at = NOW()
WHERE tournament_stat_report.tournament_id = ${tournamentId} AND tournament_stat_report.phase_id = ${phaseId} AND tournament_stat_report.report_type = ${reportType}
RETURNING *;
