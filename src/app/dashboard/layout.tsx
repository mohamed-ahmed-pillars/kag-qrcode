import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import AppSidebar from "@/components/dashboard/AppSidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <SidebarProvider>
      <AppSidebar
        role={session.user.role}
        userName={session.user.name || "User"}
        userEmail={session.user.email || ""}
      />
      <SidebarInset>
        <header className="flex h-14 items-center gap-2 border-b border-border/60 px-4 sticky top-0 bg-background/95 backdrop-blur-sm z-10 shadow-sm">
          <SidebarTrigger className="-ml-1 cursor-pointer" />
          <Separator orientation="vertical" className="h-4" />
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0" />
            <span className="text-sm font-medium text-foreground truncate">
              Cityfirstfoods
            </span>
            <span className="text-muted-foreground/40 text-sm hidden sm:block">/</span>
            <span className="text-sm text-muted-foreground hidden sm:block truncate">
              Dashboard
            </span>
          </div>
        </header>
        <div className="flex-1 p-6 max-w-7xl">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
