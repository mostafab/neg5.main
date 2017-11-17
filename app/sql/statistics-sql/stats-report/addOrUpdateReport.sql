INSERT INTO tournament_stat_report(tournament_id, phase_id, report_type, statistics)
VALUES (${tournamentId}, ${phaseId}, ${reportType}, ${stats})
ON CONFLICT(tournament_id, phase_id, report_type) DO UPDATE
SET statistics = ${stats}, last_updated_at = NOW()