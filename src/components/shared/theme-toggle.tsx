"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Button that toggles between light and dark themes.
 * Defers icon rendering until mounted to avoid hydration mismatch
 * (server doesn't know the resolved theme).
 */
const ThemeToggle = () => {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleToggle = () => {
    if (resolvedTheme === "dark") return setTheme("light");
    return setTheme("dark");
  };

  return (
    <Button variant="ghost" size="icon" onClick={handleToggle}>
      {mounted && resolvedTheme === "dark" && <Moon className="size-4" />}
      {mounted && resolvedTheme !== "dark" && <Sun className="size-4" />}
      {!mounted && <Sun className="size-4 opacity-0" />}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
};

export { ThemeToggle };
