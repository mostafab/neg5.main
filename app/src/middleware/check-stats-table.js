import { StatsReportManager } from './../managers/stats-models/report';

export default reportType => async (req, res, next) => {
  const reportManager = new StatsReportManager(req.params.tid);
  console.log('checking table for existing results.');
  try {
    const result = await reportManager.fetchReport(req.query.phase || null, reportType);
    console.log('found existing results');
    return res.json({ result, success: true });
  } catch (err) {
    if (err.name === 'ReferenceError') { // Didn't find a matching report. Go ahead and generate
      console.log('did not find shit');
      next();
    } else {
      res.status(500).send({ error: err, success: false}); // Error on something serious
    }
  }
}