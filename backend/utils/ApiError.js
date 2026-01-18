class ApiError extends Error {
  constructor(statusCode, message, details = undefined) {
    super(message);
    this.statusCode = statusCode;
    if (details) this.details = details;
  }
}

// eslint-disable-next-line no-undef
module.exports = { ApiError };
