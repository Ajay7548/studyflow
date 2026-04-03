import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { connectDB } from "@/lib/db";
import { User } from "@/models/user";
import { signUpSchema } from "@/lib/validations/auth";

/**
 * Parses and validates the request body against signUpSchema.
 * Returns the parsed data or a NextResponse error.
 */
const parseRequestBody = async ({ request }: { request: Request }) => {
  const body = await request.json();
  const result = signUpSchema.safeParse(body);

  if (!result.success) {
    const firstError = result.error.issues[0]?.message ?? "Invalid input";
    return { data: null, error: NextResponse.json({ error: firstError }, { status: 400 }) };
  }

  return { data: result.data, error: null };
};

/**
 * Checks whether a user with the given email already exists.
 * Returns a NextResponse error if so, null otherwise.
 */
const checkExistingUser = async ({ email }: { email: string }) => {
  const existing = await User.findOne({ email });
  if (!existing) return null;

  return NextResponse.json(
    { error: "An account with this email already exists" },
    { status: 409 },
  );
};

/**
 * Creates a new user document with a hashed password.
 */
const createUser = async ({
  name,
  email,
  password,
}: {
  name: string;
  email: string;
  password: string;
}) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  await User.create({ name, email, hashedPassword });
};

/**
 * POST /api/auth/signup
 *
 * Registers a new user with credentials (name, email, password).
 * Validates input with signUpSchema, checks for duplicates,
 * hashes the password, and creates the user in MongoDB.
 */
export const POST = async (request: Request) => {
  const { data, error: parseError } = await parseRequestBody({ request });
  if (parseError) return parseError;

  await connectDB();

  const existingError = await checkExistingUser({ email: data!.email });
  if (existingError) return existingError;

  await createUser({
    name: data!.name,
    email: data!.email,
    password: data!.password,
  });

  return NextResponse.json(
    { message: "Account created successfully" },
    { status: 201 },
  );
};
