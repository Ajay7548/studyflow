"use client";

import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { Menu, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { NAV_ITEMS } from "@/components/layout/sidebar";
import { cn } from "@/lib/utils";
import { APP_NAME } from "@/lib/constants";

/** Extracts initials from a name string for the avatar fallback. */
const getInitials = ({ name }: { name?: string | null }) => {
  if (!name) return "U";
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

/** Determines whether a nav link is currently active. */
const isLinkActive = ({
  pathname,
  href,
}: {
  pathname: string;
  href: string;
}) => pathname === href || pathname.startsWith(`${href}/`);

/** Mobile navigation link inside the sheet. */
const MobileNavLink = ({
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

/** Renders the mobile sidebar sheet with navigation. */
const MobileNav = ({ pathname }: { pathname: string }) => (
  <Sheet>
    <SheetTrigger
      render={<Button variant="ghost" size="icon" className="md:hidden" />}
    >
      <Menu className="size-5" />
      <span className="sr-only">Open menu</span>
    </SheetTrigger>
    <SheetContent side="left" className="w-64 p-0">
      <SheetHeader className="border-b px-4">
        <SheetTitle>{APP_NAME}</SheetTitle>
      </SheetHeader>
      <nav className="space-y-1 p-3">
        {NAV_ITEMS.map((item) => (
          <MobileNavLink
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
            active={isLinkActive({ pathname, href: item.href })}
          />
        ))}
      </nav>
    </SheetContent>
  </Sheet>
);

/** Renders the user avatar dropdown with profile info and sign-out. */
const UserMenu = ({
  name,
  email,
  image,
}: {
  name?: string | null;
  email?: string | null;
  image?: string | null;
}) => (
  <DropdownMenu>
    <DropdownMenuTrigger
      render={<Button variant="ghost" size="icon" className="rounded-full" />}
    >
      <Avatar size="sm">
        <AvatarImage src={image ?? undefined} alt={name ?? "User"} />
        <AvatarFallback>{getInitials({ name })}</AvatarFallback>
      </Avatar>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" sideOffset={8}>
      <DropdownMenuGroup>
        <DropdownMenuLabel>
          <p className="text-sm font-medium">{name ?? "User"}</p>
          <p className="text-xs text-muted-foreground">{email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>
          <LogOut className="size-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuGroup>
    </DropdownMenuContent>
  </DropdownMenu>
);

/** Renders a placeholder user menu for unauthenticated state. */
const GuestMenu = () => (
  <Link
    href="/signin"
    className="inline-flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
  >
    <User className="size-4" />
    <span className="sr-only">Sign in</span>
  </Link>
);

/** Renders either the authenticated user menu or a guest sign-in button. */
const renderUserSection = ({
  session,
}: {
  session: ReturnType<typeof useSession>["data"];
}) => {
  if (!session?.user) return <GuestMenu />;
  return (
    <UserMenu
      name={session.user.name}
      email={session.user.email}
      image={session.user.image}
    />
  );
};

/**
 * App header with mobile menu trigger, theme toggle, and user menu.
 */
const Header = () => {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <header className="flex h-14 items-center gap-2 border-b bg-card px-4">
      <MobileNav pathname={pathname} />
      <div className="flex-1" />
      <ThemeToggle />
      {renderUserSection({ session })}
    </header>
  );
};

export { Header };
