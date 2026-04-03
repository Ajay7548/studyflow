import { APP_NAME } from "@/lib/constants";

/**
 * Layout for authentication pages (signin, signup).
 * Centers content both vertically and horizontally with no sidebar.
 */
const AuthLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-12">
    <div className="w-full max-w-md space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight">{APP_NAME}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your AI-powered study companion
        </p>
      </div>
      {children}
    </div>
  </div>
);

export default AuthLayout;
