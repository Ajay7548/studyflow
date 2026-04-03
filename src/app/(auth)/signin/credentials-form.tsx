"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/** Returns the appropriate button label based on loading state. */
const signInButtonLabel = ({ isLoading }: { isLoading: boolean }) => {
  if (isLoading) return "Signing in...";
  return "Sign In";
};

/**
 * Attempts a credentials sign-in and returns the error message if any.
 */
const attemptSignIn = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  const result = await signIn("credentials", {
    email,
    password,
    redirect: false,
  });

  if (!result) return "Something went wrong. Please try again.";
  if (result.error) return "Invalid email or password.";

  return null;
};

/**
 * Client component for email/password credentials sign-in.
 * Handles form state, validation feedback, and redirect on success.
 */
export const CredentialsSignInForm = () => {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const errorMessage = await attemptSignIn({ email, password });

    if (errorMessage) {
      setError(errorMessage);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="signin-email">Email</Label>
        <Input
          id="signin-email"
          name="email"
          type="email"
          placeholder="you@example.com"
          required
          autoComplete="email"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="signin-password">Password</Label>
        <Input
          id="signin-password"
          name="password"
          type="password"
          placeholder="Your password"
          required
          minLength={6}
          autoComplete="current-password"
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {signInButtonLabel({ isLoading: loading })}
      </Button>
    </form>
  );
};
