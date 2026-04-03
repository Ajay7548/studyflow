"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";

/**
 * Wraps the app with NextAuth session context for client components.
 */
const SessionProvider = ({ children }: { children: React.ReactNode }) => (
  <NextAuthSessionProvider>{children}</NextAuthSessionProvider>
);

export { SessionProvider };
