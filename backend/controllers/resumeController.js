/* eslint-env node */
/* global module */
// Deprecated resume controller: all handlers respond with 410 Gone.
const respondGone = (res, feature) => res.status(410).json({
  success: false,
  message: `${feature || 'Resume'} endpoint deprecated; feature moved to separate service.`
});

const analyze = (req, res) => respondGone(res, 'Analyze');
const status = (req, res) => respondGone(res, 'Status');
const uploadAndExtract = (req, res) => respondGone(res, 'Upload');
const extractSkills = (req, res) => respondGone(res, 'Skills');

module.exports = { analyze, status, uploadAndExtract, extractSkills };
