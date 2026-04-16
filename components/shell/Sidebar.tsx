"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  ScanLine,
  Utensils,
  Dumbbell,
  TrendingUp,
  LogOut,
} from "lucide-react";

const NAV = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Scans", href: "/scans", icon: ScanLine },
  { label: "Meal Plan", href: "/meal-plan", icon: Utensils },
  { label: "Workout", href: "/workout", icon: Dumbbell },
  { label: "Progress", href: "/progress", icon: TrendingUp },
];

function getInitials(name: string | null | undefined, email: string) {
  if (name) {
    const parts = name.trim().split(" ");
    return parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : parts[0].slice(0, 2).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

interface SidebarProps {
  userName: string | null;
  userEmail: string;
}

export function Sidebar({ userName, userEmail }: SidebarProps) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  return (
    <aside
      className="hidden md:flex flex-col fixed left-0 top-0 h-full w-[240px] border-r border-white/6 z-40"
      style={{ background: "#0f0f0f" }}
    >
      {/* Logo */}
      <div className="px-6 pt-7 pb-6">
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
            style={{ background: "#a3e635" }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M2 3L7 11L12 3"
                stroke="#0a0a0a"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span
            className="text-[17px] font-bold text-white tracking-tight"
            style={{ fontFamily: "var(--font-syne), sans-serif" }}
          >
            Vital
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5">
        {NAV.map(({ label, href, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${
                active
                  ? "text-lime-400 bg-lime-400/8 font-medium"
                  : "text-white/40 hover:text-white/70 hover:bg-white/4"
              }`}
            >
              <Icon size={16} strokeWidth={active ? 2 : 1.5} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-3 pb-5 pt-4 border-t border-white/6">
        <div className="flex items-center gap-3 px-3 py-2.5">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-black"
            style={{ background: "#a3e635" }}
          >
            {getInitials(userName, userEmail)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium text-white truncate leading-tight">
              {userName ?? userEmail}
            </p>
            <p className="text-[11px] text-white/30 truncate">{userEmail}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="mt-1 w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-white/30 hover:text-white/60 hover:bg-white/4 transition-colors"
        >
          <LogOut size={14} strokeWidth={1.5} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
