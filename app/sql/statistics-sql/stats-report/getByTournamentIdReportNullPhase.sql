SELECT * from tournament_stat_report
WHERE tournament_id = ${tournamentId} AND phase_id IS NULL AND report_type = ${reportType};

