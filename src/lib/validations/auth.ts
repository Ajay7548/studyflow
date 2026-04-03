import { z } from "zod";

/**
 * Schema for signing in with email and password.
 *
 * - email: must be a valid email address
 * - password: at least 6 characters
 */
export const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

/**
 * Schema for creating a new account.
 *
 * - name: display name, at least 2 characters
 * - email: must be a valid email address
 * - password: at least 6 characters
 */
export const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

/** Inferred type for sign-in form data. */
export type SignInInput = z.infer<typeof signInSchema>;

/** Inferred type for sign-up form data. */
export type SignUpInput = z.infer<typeof signUpSchema>;
