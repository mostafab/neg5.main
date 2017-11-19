export default report => ({
  id: report.id,
  tournament_id: report.tournamnt_id,
  phase_id: report.phase_id,
  stats: report.statistics.stats,
  report_type: report.report_type,
  created_at: report.created_at,
  last_updated_at: report.last_updated_at,
});
