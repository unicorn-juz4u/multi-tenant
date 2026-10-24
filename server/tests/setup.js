import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { createApp } from '../src/app.js';

let localMongod = null;

export const setupTestDB = () => {
  let app;

  beforeAll(async () => {
    let uri = process.env.TEST_MONGODB_URI;
    if (!uri) {
      if (!localMongod) {
        localMongod = await MongoMemoryServer.create();
      }
      uri = localMongod.getUri();
    }

    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(uri);
    }

    app = createApp();
  }, 60000);

  afterEach(async () => {
    if (mongoose.connection.readyState !== 0) {
      const collections = mongoose.connection.collections;
      for (const key in collections) {
        await collections[key].deleteMany({});
      }
    }
  });

  afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    if (localMongod) {
      await localMongod.stop();
      localMongod = null;
    }
  });

  return {
    getApp: () => app,
  };
};

export default setupTestDB;
