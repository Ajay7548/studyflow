import { handlers } from "@/lib/auth";

/**
 * NextAuth v5 route handler.
 * Delegates GET and POST to the auto-generated handlers from the auth config.
 */
export const { GET, POST } = handlers;
