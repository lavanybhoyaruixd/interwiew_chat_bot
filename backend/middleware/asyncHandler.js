// Small utility to avoid repeating try/catch in every route handler
// Usage: router.get('/path', asyncHandler(controller.fn))
function asyncHandler(fn) {
  return function wrapped(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
// eslint-disable-next-line no-undef
module.exports = asyncHandler; // CommonJS export (backend uses require())
