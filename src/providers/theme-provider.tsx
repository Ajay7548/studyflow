"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * Wraps the app with next-themes context for dark/light mode support.
 */
const ThemeProvider = ({ children }: { children: React.ReactNode }) => (
  <NextThemesProvider
    attribute="class"
    defaultTheme="system"
    enableSystem
    disableTransitionOnChange
  >
    {children}
  </NextThemesProvider>
);

export { ThemeProvider };
