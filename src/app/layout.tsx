import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { SessionProvider } from "@/providers/session-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { APP_NAME } from "@/lib/constants";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

/** Root metadata for the entire application. */
export const metadata: Metadata = {
  title: `${APP_NAME} — AI-Powered Study Platform`,
  description:
    "Master any subject with AI-generated flashcards, smart quizzes, and spaced repetition. Track your progress and study smarter.",
};

/**
 * Root layout that wraps the entire application with providers,
 * fonts, and global UI elements.
 */
const RootLayout = ({ children }: { children: React.ReactNode }) => (
  <html
    lang="en"
    className={`${inter.variable} h-full antialiased`}
    suppressHydrationWarning
  >
    <body className="min-h-full flex flex-col">
      <SessionProvider>
        <ThemeProvider>
          {children}
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </SessionProvider>
    </body>
  </html>
);

export default RootLayout;
