import { MongoMemoryServer } from 'mongodb-memory-server';

export default async function globalSetup() {
  const mongod = await MongoMemoryServer.create();
  process.env.TEST_MONGODB_URI = mongod.getUri();
  global.__MONGOD__ = mongod;
}
