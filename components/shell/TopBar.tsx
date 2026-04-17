"use client";

import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import { LogOut } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

const TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/scans": "Scans",
  "/scans/new": "New Scan",
  "/meal-plan": "Meal Plan",
  "/workout": "Workout",
  "/progress": "Progress",
};

function getTitle(pathname: string): string {
  if (TITLES[pathname]) return TITLES[pathname];
  if (pathname.startsWith("/scans/")) return "Scan Details";
  if (pathname.startsWith("/meal-plan/")) return "Meal Plan";
  if (pathname.startsWith("/workout/")) return "Workout";
  return "Vital";
}

function getInitials(name: string | null | undefined, email: string) {
  if (name) {
    const parts = name.trim().split(" ");
    return parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : parts[0].slice(0, 2).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

interface TopBarProps {
  userName: string | null;
  userEmail: string;
}

export function TopBar({ userName, userEmail }: TopBarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <header className="md:hidden fixed top-0 left-0 right-0 z-40 h-14 flex items-center justify-between px-4 border-b border-border bg-background/95 backdrop-blur-md">
      {/* Page title */}
      <h1
        className="text-[15px] font-bold text-foreground tracking-tight"
        style={{ fontFamily: "var(--font-syne), sans-serif" }}
      >
        {getTitle(pathname)}
      </h1>

      <div className="flex items-center gap-1">
        <ThemeToggle />

        {/* Avatar + dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setOpen((v) => !v)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-black transition-opacity hover:opacity-80"
            style={{ background: "#a3e635" }}
          >
            {getInitials(userName, userEmail)}
          </button>

          {open && (
            <div className="absolute right-0 top-10 w-52 rounded-xl border border-border bg-popover overflow-hidden z-50 shadow-lg">
              <div className="px-4 py-3 border-b border-border">
                <p className="text-[13px] font-medium text-popover-foreground truncate">{userName ?? userEmail}</p>
                <p className="text-[11px] text-muted-foreground truncate">{userEmail}</p>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                <LogOut size={14} strokeWidth={1.5} />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
