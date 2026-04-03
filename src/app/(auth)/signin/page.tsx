import type { Metadata } from "next";
import Link from "next/link";

import { signIn } from "@/lib/auth";
import { APP_NAME } from "@/lib/constants";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CredentialsSignInForm } from "./credentials-form";

export const metadata: Metadata = {
  title: `Sign In - ${APP_NAME}`,
};

/**
 * Server action for Google OAuth sign-in.
 */
const signInWithGoogle = async () => {
  "use server";
  await signIn("google", { redirectTo: "/dashboard" });
};

/**
 * Server action for GitHub OAuth sign-in.
 */
const signInWithGithub = async () => {
  "use server";
  await signIn("github", { redirectTo: "/dashboard" });
};

/**
 * Sign-in page with Google, GitHub, and email/password options.
 */
const SignInPage = () => (
  <Card>
    <CardHeader>
      <CardTitle>Sign In</CardTitle>
      <CardDescription>
        Choose a method to sign in to your account
      </CardDescription>
    </CardHeader>

    <CardContent className="space-y-4">
      <div className="grid gap-2">
        <form action={signInWithGoogle}>
          <Button variant="outline" className="w-full" type="submit">
            Continue with Google
          </Button>
        </form>

        <form action={signInWithGithub}>
          <Button variant="outline" className="w-full" type="submit">
            Continue with GitHub
          </Button>
        </form>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">
            Or continue with email
          </span>
        </div>
      </div>

      <CredentialsSignInForm />
    </CardContent>

    <CardFooter className="justify-center">
      <p className="text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-primary underline-offset-4 hover:underline">
          Sign up
        </Link>
      </p>
    </CardFooter>
  </Card>
);

export default SignInPage;
