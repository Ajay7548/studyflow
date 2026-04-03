import { MongoClient } from "mongodb";

const globalWithMongo = globalThis as typeof globalThis & {
  _mongoClientPromise?: Promise<MongoClient>;
};

const getMongoUri = (): string => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not defined in environment variables");
  }
  return uri;
};

const buildClientPromise = (): Promise<MongoClient> => {
  const client = new MongoClient(getMongoUri());
  return client.connect();
};

/**
 * A singleton MongoClient promise for the NextAuth MongoDB adapter.
 *
 * This is intentionally separate from the Mongoose connection in `db.ts`
 * because the `@auth/mongodb-adapter` expects a raw `MongoClient`, not a
 * Mongoose instance. The promise is cached on `globalThis` so dev-mode
 * HMR does not spawn extra connections.
 *
 * @example
 * ```ts
 * import { clientPromise } from "@/lib/mongodb-client";
 * import { MongoDBAdapter } from "@auth/mongodb-adapter";
 *
 * export const authOptions = {
 *   adapter: MongoDBAdapter(clientPromise),
 * };
 * ```
 */
const resolveClientPromise = (): Promise<MongoClient> => {
  if (process.env.NODE_ENV === "development") {
    if (!globalWithMongo._mongoClientPromise) {
      globalWithMongo._mongoClientPromise = buildClientPromise();
    }
    return globalWithMongo._mongoClientPromise;
  }

  return buildClientPromise();
};

export const clientPromise: Promise<MongoClient> = resolveClientPromise();
