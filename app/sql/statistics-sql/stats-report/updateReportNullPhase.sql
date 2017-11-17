UPDATE tournament_stat_report
SET statistics = ${stats}, last_updated_at = NOW()
WHERE tournament_stat_report.tournament_id = ${tournamentId} AND tournament_stat_report.phase_id IS NULL AND tournament_stat_report.report_type = ${reportType}
RETURNING *;
