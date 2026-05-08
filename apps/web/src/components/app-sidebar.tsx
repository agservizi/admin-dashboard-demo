import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Package } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

const items = [
  { to: "/", label: "Home", icon: LayoutDashboard },
  { to: "/resources", label: "Risorse", icon: Package },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="gap-0 border-b border-sidebar-border px-2 py-3">
        <div className="flex flex-col gap-0.5 px-2">
          <span className="font-semibold">Admin demo</span>
          <span className="text-muted-foreground text-xs">Dashboard</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <ScrollArea className="h-full">
          <SidebarGroup>
            <SidebarGroupLabel>Navigazione</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map(({ to, label, icon: Icon }) => (
                  <SidebarMenuItem key={to}>
                    <SidebarMenuButton
                      asChild
                      isActive={
                        to === "/"
                          ? location.pathname === "/"
                          : location.pathname.startsWith(to)
                      }
                      tooltip={label}
                    >
                      <Link to={to}>
                        <Icon />
                        <span>{label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </ScrollArea>
      </SidebarContent>
      <Separator className="bg-sidebar-border" />
      <SidebarRail />
    </Sidebar>
  );
}
