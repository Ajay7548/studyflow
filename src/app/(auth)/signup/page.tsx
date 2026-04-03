import type { Metadata } from "next";
import Link from "next/link";

import { APP_NAME } from "@/lib/constants";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SignUpForm } from "./signup-form";

export const metadata: Metadata = {
  title: `Sign Up - ${APP_NAME}`,
};

/**
 * Sign-up page with name, email, and password fields.
 * Delegates form handling to the client-side SignUpForm component.
 */
const SignUpPage = () => (
  <Card>
    <CardHeader>
      <CardTitle>Create Account</CardTitle>
      <CardDescription>
        Enter your details to get started with {APP_NAME}
      </CardDescription>
    </CardHeader>

    <CardContent>
      <SignUpForm />
    </CardContent>

    <CardFooter className="justify-center">
      <p className="text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/signin" className="text-primary underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
    </CardFooter>
  </Card>
);

export default SignUpPage;
