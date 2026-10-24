import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import env from './config/env.js';
import routes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimit.js';

export const createApp = () => {
  const app = express();

  // Security HTTP headers
  app.use(helmet());

  // CORS configuration with whitelisted client origin and credentials support
  app.use(
    cors({
      origin: [env.CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
      credentials: true,
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
  );

  // Rate limit all requests to /api
  app.use('/api', apiLimiter);

  // Cookie parser with optional secret
  app.use(cookieParser(env.COOKIE_SECRET));

  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Sanitize data against NoSQL injection
  app.use(mongoSanitize());

  // Mount API endpoints
  app.use('/api', routes);

  // 404 handler for unknown routes
  app.use('*', (req, res) => {
    res.status(404).json({
      success: false,
      message: `API route '${req.originalUrl}' not found`,
    });
  });

  // Centralized Error Handler
  app.use(errorHandler);

  return app;
};

export default createApp;
