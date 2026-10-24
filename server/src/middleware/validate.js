import { ApiError } from '../utils/ApiError.js';

export const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    // Replace with parsed and typed data (coerced numbers, sanitized strings)
    if (parsed.body) req.body = parsed.body;
    if (parsed.query) req.query = parsed.query;
    if (parsed.params) req.params = parsed.params;

    next();
  } catch (error) {
    if (error.issues) {
      const formattedErrors = error.issues.map((issue) => ({
        field: issue.path.slice(1).join('.') || issue.path.join('.'),
        message: issue.message,
      }));
      return next(new ApiError(400, 'Validation failed', formattedErrors));
    }
    next(error);
  }
};

export default validate;
