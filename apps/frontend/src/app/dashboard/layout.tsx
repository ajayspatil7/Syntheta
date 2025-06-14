"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Database,
  Code2,
  LineChart,
  Settings,
  User,
  Bell,
  ChevronDown,
  Menu,
  X,
  Package,
  PlayCircle,
  BarChart3,
  Store,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const navigation = [
  {
    name: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Pipelines",
    href: "/dashboard/pipelines",
    icon: Database,
  },
  {
    name: "DAG Builder",
    href: "/dashboard/builder",
    icon: Code2,
  },
  {
    name: "Evaluation",
    href: "/dashboard/evaluation",
    icon: LineChart,
  },
  {
    name: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart3,
  },
  {
    name: "Marketplace",
    href: "/dashboard/marketplace",
    icon: Store,
  },
  {
    name: "Documentation",
    href: "/dashboard/docs",
    icon: FileText,
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const handleSignOut = () => {
    // Clear authentication tokens from localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    
    // Clear authentication cookies
    document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    
    // Force a hard navigation to login page
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-syntheta-background">
      {/* Header */}
      <header className="fixed top-0 z-50 w-full border-b border-white/10 bg-white/60 backdrop-blur-xl">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? (
                <X className="h-5 w-5 text-syntheta-dark/60" />
              ) : (
                <Menu className="h-5 w-5 text-syntheta-dark/60" />
              )}
            </Button>
            <Link href="/dashboard" className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-syntheta-primary" />
              <span className="text-sm font-medium tracking-wide text-syntheta-dark">
                Syntheta
              </span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center space-x-2 rounded-full border border-white/20 bg-white/40 px-3 py-1.5 text-sm font-medium text-syntheta-dark hover:bg-white/60"
                >
                  <span>Production</span>
                  <ChevronDown className="h-4 w-4 text-syntheta-dark/60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-48 rounded-lg border border-white/20 bg-white/80 p-1 backdrop-blur-xl"
              >
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/environments/production" className="text-sm text-syntheta-dark">
                    Production
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/environments/staging" className="text-sm text-syntheta-dark">
                    Staging
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/environments/development" className="text-sm text-syntheta-dark">
                    Development
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="ghost"
              size="icon"
              className="relative text-syntheta-dark/60 hover:text-syntheta-dark"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-syntheta-primary" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full border border-white/20 bg-white/40 text-syntheta-dark hover:bg-white/60"
                >
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-48 rounded-lg border border-white/20 bg-white/80 p-1 backdrop-blur-xl"
              >
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/profile" className="text-sm text-syntheta-dark">
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="text-sm text-syntheta-dark">
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-sm text-red-600 cursor-pointer"
                  onClick={handleSignOut}
                >
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-64 transform border-r border-white/10 bg-white/60 backdrop-blur-xl transition-transform duration-200 ease-in-out",
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <nav className="flex h-full flex-col space-y-1 p-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-syntheta-primary/10 text-syntheta-primary"
                    : "text-syntheta-dark/60 hover:bg-white/40 hover:text-syntheta-dark"
                )}
              >
                <item.icon
                  className={cn(
                    "h-4 w-4 transition-colors",
                    isActive
                      ? "text-syntheta-primary"
                      : "text-syntheta-dark/40 group-hover:text-syntheta-dark/60"
                  )}
                />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main
        className={cn(
          "min-h-screen pt-16 transition-all duration-200 ease-in-out",
          sidebarOpen ? "md:pl-64" : "pl-0 md:pl-64"
        )}
      >
        <div className="container mx-auto p-6">{children}</div>
      </main>
    </div>
  );
}