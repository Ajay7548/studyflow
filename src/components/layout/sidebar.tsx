"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Repeat,
  Brain,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { APP_NAME } from "@/lib/constants";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/notes", label: "Notes", icon: FileText },
  { href: "/review", label: "Review", icon: Repeat },
  { href: "/quizzes", label: "Quizzes", icon: Brain },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
] as const;

/** Determines whether a nav link is currently active. */
const isLinkActive = ({
  pathname,
  href,
}: {
  pathname: string;
  href: string;
}) => pathname === href || pathname.startsWith(`${href}/`);

/** Renders a single navigation link with active state styling. */
const NavLink = ({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
}) => (
  <Link
    href={href}
    className={cn(
      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
      active && "bg-primary/10 text-primary",
      !active && "text-muted-foreground hover:bg-muted hover:text-foreground"
    )}
  >
    <Icon className="size-4" />
    {label}
  </Link>
);

/**
 * App sidebar with navigation links. Highlights the active route.
 */
const Sidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-64 flex-col border-r bg-card">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/dashboard" className="text-lg font-bold">
          {APP_NAME}
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
            active={isLinkActive({ pathname, href: item.href })}
          />
        ))}
      </nav>
    </aside>
  );
};

export { Sidebar, NAV_ITEMS };
