import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Sidebar } from "@/components/shell/Sidebar";
import { BottomNav } from "@/components/shell/BottomNav";
import { TopBar } from "@/components/shell/TopBar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login");

  const userName = session.user.name ?? null;
  const userEmail = session.user.email ?? "";

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <Sidebar userName={userName} userEmail={userEmail} />

      {/* Mobile top bar */}
      <TopBar userName={userName} userEmail={userEmail} />

      {/* Main content */}
      <main className="md:ml-[240px] pt-14 md:pt-0 pb-20 md:pb-0 min-h-screen">
        {children}
      </main>

      {/* Mobile bottom nav */}
      <BottomNav />
    </div>
  );
}
