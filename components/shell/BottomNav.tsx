"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ScanLine,
  Utensils,
  Dumbbell,
  TrendingUp,
} from "lucide-react";

const NAV = [
  { label: "Home", href: "/dashboard", icon: LayoutDashboard },
  { label: "Scans", href: "/scans", icon: ScanLine },
  { label: "Meals", href: "/meal-plan", icon: Utensils },
  { label: "Workout", href: "/workout", icon: Dumbbell },
  { label: "Progress", href: "/progress", icon: TrendingUp },
];

export function BottomNav() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 border-t border-white/6 z-40"
      style={{
        background: "rgba(15,15,15,0.96)",
        backdropFilter: "blur(12px)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <div className="flex items-stretch">
        {NAV.map(({ label, href, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className="flex-1 flex flex-col items-center justify-center gap-1 py-3 transition-colors"
              style={{ color: active ? "#a3e635" : "rgba(255,255,255,0.3)" }}
            >
              <Icon size={20} strokeWidth={active ? 2 : 1.5} />
              <span className="text-[10px] font-medium tracking-wide">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
