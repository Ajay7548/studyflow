import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import bcrypt from "bcryptjs";

import { clientPromise } from "@/lib/mongodb-client";
import { connectDB } from "@/lib/db";
import { User } from "@/models/user";
import { signInSchema } from "@/lib/validations/auth";

/**
 * Finds an existing user by email or returns null.
 * Connects to MongoDB before querying.
 */
const findUserByEmail = async ({ email }: { email: string }) => {
  await connectDB();
  return User.findOne({ email }).select("+hashedPassword");
};

/**
 * Validates credentials against the sign-in schema and database.
 * Returns the user document when valid, null otherwise.
 */
const validateCredentials = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  const parsed = signInSchema.safeParse({ email, password });
  if (!parsed.success) return null;

  const user = await findUserByEmail({ email: parsed.data.email });
  if (!user) return null;
  if (!user.hashedPassword) return null;

  const isValid = await bcrypt.compare(password, user.hashedPassword);
  if (!isValid) return null;

  return { id: user._id.toString(), name: user.name, email: user.email };
};

/**
 * Returns or creates a dev/test user for local development and Playwright.
 * Only active when NODE_ENV is "development".
 */
const getOrCreateDevUser = async () => {
  await connectDB();

  const devEmail = "dev@studyflow.local";
  const existing = await User.findOne({ email: devEmail });
  if (existing) {
    return {
      id: existing._id.toString(),
      name: existing.name,
      email: existing.email,
    };
  }

  const hashed = await bcrypt.hash("devpassword", 10);
  const created = await User.create({
    name: "Dev User",
    email: devEmail,
    hashedPassword: hashed,
  });

  return {
    id: created._id.toString(),
    name: created.name,
    email: created.email,
  };
};

/**
 * Checks whether the incoming credentials match the dev bypass.
 */
const isDevBypass = ({
  email,
  password,
}: {
  email: string;
  password: string;
}) =>
  process.env.NODE_ENV === "development" &&
  email === "dev@studyflow.local" &&
  password === "devpassword";

/**
 * NextAuth v5 configuration for StudyFlow.
 *
 * Provides Google, GitHub, and Credentials authentication with
 * JWT session strategy and a MongoDB adapter for account linking.
 *
 * Exports: handlers (GET/POST), auth, signIn, signOut.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: MongoDBAdapter(clientPromise),
  session: { strategy: "jwt" },
  pages: { signIn: "/signin" },

  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        if (isDevBypass({ email, password })) {
          return getOrCreateDevUser();
        }

        return validateCredentials({ email, password });
      },
    }),
  ],

  callbacks: {
    jwt: async ({ token, user }) => {
      if (user?.id) {
        token.id = user.id;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (token?.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});
