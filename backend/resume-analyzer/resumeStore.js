// Simple in-memory store for resume analysis
// ES module export
let _resumeData = null;

export function setResumeData({ text, meta = {} }) {
  _resumeData = {
    text: typeof text === 'string' ? text : '',
    meta: {
      uploadedAt: new Date().toISOString(),
      ...meta,
    },
  };
}

export function getResumeData() {
  return _resumeData;
}

export function clearResumeData() {
  _resumeData = null;
}
