import { Outlet } from "react-router-dom";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppSidebar } from "@/components/app-sidebar";
import { AppHeader } from "@/components/app-header";
import { useMatches } from "react-router-dom";

export function DashboardShell() {
  const matches = useMatches();
  const handleMatch = [...matches].reverse().find(
    (m) => m.handle && typeof (m.handle as { title?: string }).title === "string",
  );
  const title =
    (handleMatch?.handle as { title?: string } | undefined)?.title ??
    "Dashboard";

  return (
    <SidebarProvider>
      <TooltipProvider delayDuration={0}>
        <AppSidebar />
        <SidebarInset>
          <AppHeader title={title} />
          <div className="flex flex-1 flex-col gap-4 p-4">
            <Outlet />
          </div>
        </SidebarInset>
      </TooltipProvider>
    </SidebarProvider>
  );
}
