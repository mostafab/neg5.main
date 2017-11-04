export default () =>
  (divisions, phaseId = null) =>
    divisions.filter(d => d.phaseId === phaseId || phaseId === null);
