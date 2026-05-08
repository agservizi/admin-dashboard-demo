import { Moon, Sun, LogOut, User } from "lucide-react";
import { useTheme } from "next-themes";
import { Link, useNavigate } from "react-router-dom";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { clearDemoAuth } from "@/lib/auth";

export function AppHeader({ title }: { title: string }) {
  const { setTheme, theme } = useTheme();
  const navigate = useNavigate();

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <h1 className="text-foreground font-medium">{title}</h1>
      <div className="ml-auto flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label={
                theme === "dark" ? "Attiva tema chiaro" : "Attiva tema scuro"
              }
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <Sun className="hidden dark:block" />
              <Moon className="dark:hidden" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Chiaro / scuro</TooltipContent>
        </Tooltip>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative size-9 rounded-full">
              <Avatar className="size-9">
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
              <span className="sr-only">Menu utente</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel>Account demo</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/" className="cursor-pointer">
                <User />
                Profilo (stub)
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer text-destructive focus:text-destructive"
              onClick={() => {
                clearDemoAuth();
                navigate("/login", { replace: true });
              }}
            >
              <LogOut />
              Esci
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
