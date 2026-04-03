"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/** Returns the appropriate button label based on loading state. */
const signUpButtonLabel = ({ isLoading }: { isLoading: boolean }) => {
  if (isLoading) return "Creating account...";
  return "Create Account";
};

/**
 * Posts registration data to the signup API and returns any error message.
 */
const submitSignUp = async ({
  name,
  email,
  password,
}: {
  name: string;
  email: string;
  password: string;
}) => {
  const res = await fetch("/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });

  const data = await res.json();

  if (!res.ok) return data.error || "Registration failed. Please try again.";

  return null;
};

/**
 * Client component for the sign-up form.
 * Validates on the server via the /api/auth/signup route, then
 * redirects to /signin on success.
 */
export const SignUpForm = () => {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const errorMessage = await submitSignUp({ name, email, password });

    if (errorMessage) {
      setError(errorMessage);
      setLoading(false);
      return;
    }

    router.push("/signin?registered=true");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="signup-name">Name</Label>
        <Input
          id="signup-name"
          name="name"
          type="text"
          placeholder="Your name"
          required
          minLength={2}
          autoComplete="name"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="signup-email">Email</Label>
        <Input
          id="signup-email"
          name="email"
          type="email"
          placeholder="you@example.com"
          required
          autoComplete="email"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="signup-password">Password</Label>
        <Input
          id="signup-password"
          name="password"
          type="password"
          placeholder="At least 6 characters"
          required
          minLength={6}
          autoComplete="new-password"
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {signUpButtonLabel({ isLoading: loading })}
      </Button>
    </form>
  );
};
