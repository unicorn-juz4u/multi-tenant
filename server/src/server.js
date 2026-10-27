import { createApp } from './app.js';
import { connectDB, disconnectDB } from './config/db.js';
import env from './config/env.js';

let mongodInstance = null;

const startServer = async () => {
  try {
    let mongoUri = env.MONGODB_URI;

    try {
      await connectDB(mongoUri);
    } catch (err) {
      if (env.NODE_ENV !== 'production') {
        console.warn(`[MongoDB] Could not connect to '${mongoUri}'. Starting in-memory MongoDB fallback...`);
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        mongodInstance = await MongoMemoryServer.create();
        mongoUri = mongodInstance.getUri();
        await connectDB(mongoUri);
        console.log(`[MongoDB] In-memory instance running at ${mongoUri}`);
        const { seedData } = await import('./seed/seed.js');
        await seedData(false);
      } else {
        throw err;
      }
    }

    const app = createApp();
    const server = app.listen(env.PORT, () => {
      const publicUrl = process.env.RENDER_EXTERNAL_URL || process.env.PUBLIC_URL || process.env.SERVER_URL;
      const host = publicUrl || (env.NODE_ENV === 'production' ? `port ${env.PORT}` : `http://localhost:${env.PORT}`);
      console.log(`[Server] Running in ${env.NODE_ENV} mode on ${host}`);
    });

    const shutdown = async (signal) => {
      console.log(`[Server] Received ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        await disconnectDB();
        if (mongodInstance) {
          await mongodInstance.stop();
        }
        console.log('[Server] Graceful shutdown completed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    console.error('[Server] Fatal startup error:', error);
    process.exit(1);
  }
};

startServer();
