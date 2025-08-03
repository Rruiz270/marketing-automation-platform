import mongoose from 'mongoose';
import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose;
let mongoClient = global.mongoClient;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

if (!mongoClient) {
  mongoClient = global.mongoClient = { client: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

// MongoDB Native Client for Meta APIs
export async function connectToDatabase() {
  if (mongoClient.client) {
    return {
      client: mongoClient.client,
      db: mongoClient.client.db()
    };
  }

  if (!mongoClient.promise) {
    mongoClient.promise = MongoClient.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  }

  try {
    mongoClient.client = await mongoClient.promise;
    return {
      client: mongoClient.client,
      db: mongoClient.client.db()
    };
  } catch (e) {
    mongoClient.promise = null;
    throw e;
  }
}

export default dbConnect;