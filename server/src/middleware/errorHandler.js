import env from '../config/env.js';

export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = err.errors || [];

  // Handle Mongoose Bad ObjectId (CastError) -> 404 Not Found to avoid leaking
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404;
    message = 'Resource not found';
    errors = [];
  }

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Database validation error';
    errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
  }

  // Handle Mongo Duplicate Key Error (E11000)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `Duplicate entry for ${field}. Value already exists.`;
    errors = [{ field, message: `The ${field} '${err.keyValue[field]}' is already in use.` }];
  }

  // Handle JWT errors if unhandled
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token signature';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token has expired';
  }

  // Log server errors
  if (statusCode >= 500 && env.NODE_ENV !== 'test') {
    console.error('[Unhandled Error]', err);
  }

  const response = {
    success: false,
    message,
    ...(errors.length > 0 && { errors }),
    ...(env.NODE_ENV === 'development' && statusCode >= 500 && { stack: err.stack }),
  };

  res.status(statusCode).json(response);
};

export default errorHandler;
