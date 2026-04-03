import mongoose from "mongoose";

/**
 * Cached Mongoose connection stored on globalThis to survive
 * Next.js hot-module reloads in development.
 */
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

const globalWithMongoose = globalThis as typeof globalThis & {
  _mongooseCache?: MongooseCache;
};

const getMongoUri = (): string => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not defined in environment variables");
  }
  return uri;
};

const getCache = (): MongooseCache => {
  if (!globalWithMongoose._mongooseCache) {
    globalWithMongoose._mongooseCache = { conn: null, promise: null };
  }
  return globalWithMongoose._mongooseCache;
};

/**
 * Returns a cached Mongoose connection, creating one on first call.
 * Uses `bufferCommands: false` so operations fail fast when disconnected.
 * The connection is stored on `globalThis` to persist across HMR in dev.
 *
 * @returns The connected Mongoose instance.
 *
 * @example
 * ```ts
 * import { connectDB } from "@/lib/db";
 *
 * const handler = async () => {
 *   await connectDB();
 *   // ... use Mongoose models
 * };
 * ```
 */
export const connectDB = async (): Promise<typeof mongoose> => {
  const cache = getCache();

  if (cache.conn) {
    return cache.conn;
  }

  if (!cache.promise) {
    cache.promise = mongoose.connect(getMongoUri(), {
      bufferCommands: false,
    });
  }

  cache.conn = await cache.promise;
  return cache.conn;
};
