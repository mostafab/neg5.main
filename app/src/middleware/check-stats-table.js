import { StatsReportManager } from './../managers/stats-models/report';

export default reportType => async (req, res, next) => {
  const reportManager = new StatsReportManager(req.params.tid);
  try {
    const result = await reportManager.fetchReport(req.query.phase, reportType);
    return res.json({ result, success: true });
  } catch (err) {
    if (err.name === 'ReferenceError') { // Didn't find a matching report. Go ahead and generate
      next();
    } else {
      res.status(500).send({ error: err, success: false}); // Error on something serious
    }
  }
}