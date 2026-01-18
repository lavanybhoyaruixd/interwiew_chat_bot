// In-memory storage for resume text
let userResumeText = '';

/**
 * Sets the current user's resume text
 * @param {string} text - The extracted resume text
 * @returns {string} The stored text (truncated to 4000 chars)
 */
function setResumeText(text) {
  userResumeText = String(text || '').slice(0, 4000);
  return userResumeText;
}

/**
 * Gets the current user's resume text
 * @returns {string} The stored resume text
 */
function getResumeText() {
  return userResumeText;
}

/**
 * Clears the stored resume text
 */
function clearResumeText() {
  userResumeText = '';
}

module.exports = {
  setResumeText,
  getResumeText,
  clearResumeText
};
