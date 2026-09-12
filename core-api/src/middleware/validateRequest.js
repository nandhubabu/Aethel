const { AppError } = require('./errorHandler');

/**
 * Express middleware factory that validates req.body against a Zod schema.
 * Usage: router.post('/route', validateRequest(myZodSchema), controller)
 */
function validateRequest(schema) {
  return (req, _res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const messages = result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
      const err = new AppError(`Validation failed: ${messages.join('; ')}`, 400);
      return next(err);
    }
    req.validatedBody = result.data;
    next();
  };
}

module.exports = { validateRequest };
