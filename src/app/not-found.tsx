import Link from "next/link";

/**
 * Custom 404 page displayed when a route is not found.
 */
const NotFound = () => (
  <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
    <h1 className="text-6xl font-bold">404</h1>
    <p className="text-lg text-muted-foreground">
      The page you are looking for does not exist.
    </p>
    <Link
      href="/dashboard"
      className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
    >
      Back to Dashboard
    </Link>
  </div>
);

export default NotFound;
