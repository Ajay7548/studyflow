import Link from "next/link";
import { APP_NAME } from "@/lib/constants";

/**
 * Site footer with author credit, social links, and branding.
 */
const Footer = () => (
  <footer className="border-t py-6">
    <div className="mx-auto flex max-w-7xl flex-col items-center gap-2 px-4 text-sm text-muted-foreground">
      <div className="flex items-center gap-4">
        <span>Built by Your Name</span>
        <Link
          href="https://github.com/Ajay7548"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-4 hover:text-foreground"
        >
          GitHub
        </Link>
        <Link
          href="www.linkedin.com/in/ajay-m-22b643150"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-4 hover:text-foreground"
        >
          LinkedIn
        </Link>
      </div>
      <p>Powered by {APP_NAME}</p>
    </div>
  </footer>
);

export { Footer };
