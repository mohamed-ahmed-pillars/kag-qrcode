"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Users,
  Package,
  Megaphone,
  Link2,
  BarChart3,
  LogOut,
  UserCog,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import type { Role } from "@/lib/schema";

interface Props {
  role: Role;
  userName: string;
  userEmail: string;
}

const NAV_ITEMS = [
  {
    title: "Overview",
    url: "/dashboard",
    icon: LayoutDashboard,
    exact: true,
    minRole: "viewer" as Role,
  },
  {
    title: "Analytics",
    url: "/dashboard/analytics",
    icon: BarChart3,
    minRole: "viewer" as Role,
  },
  {
    title: "Social Links",
    url: "/dashboard/social-links",
    icon: Link2,
    minRole: "editor" as Role,
  },
  {
    title: "Employees",
    url: "/dashboard/employees",
    icon: Users,
    minRole: "editor" as Role,
  },
  {
    title: "Products",
    url: "/dashboard/products",
    icon: Package,
    minRole: "editor" as Role,
  },
  {
    title: "Ads & Promotions",
    url: "/dashboard/ads",
    icon: Megaphone,
    minRole: "editor" as Role,
  },
  {
    title: "User Management",
    url: "/dashboard/users",
    icon: UserCog,
    minRole: "super_admin" as Role,
  },
];

const ROLE_HIERARCHY: Record<Role, number> = {
  viewer: 1,
  editor: 2,
  admin: 3,
  super_admin: 4,
};

const ROLE_LABELS: Record<Role, string> = {
  viewer: "Viewer",
  editor: "Editor",
  admin: "Admin",
  super_admin: "Super Admin",
};

const ROLE_COLORS: Record<Role, string> = {
  viewer: "bg-slate-500/20 text-slate-200 border-slate-500/30",
  editor: "bg-sky-500/20 text-sky-200 border-sky-500/30",
  admin: "bg-amber-500/20 text-amber-200 border-amber-500/30",
  super_admin: "bg-orange-500/20 text-orange-200 border-orange-500/30",
};

export default function AppSidebar({ role, userName, userEmail }: Props) {
  const pathname = usePathname();

  const visibleItems = NAV_ITEMS.filter(
    (item) => ROLE_HIERARCHY[role] >= ROLE_HIERARCHY[item.minRole]
  );

  const isActive = (item: (typeof NAV_ITEMS)[0]) => {
    if (item.exact) return pathname === item.url;
    return pathname.startsWith(item.url);
  };

  return (
    <Sidebar>
      {/* Brand Header */}
      <SidebarHeader className="px-4 py-5 border-b border-sidebar-border">
        <Link href="/" target="_blank" className="flex items-center gap-3 group cursor-pointer">
          <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 ring-2 ring-orange-400/30 group-hover:ring-orange-400/60 transition-all duration-200">
            <Image
              src="/kag-logo.png"
              alt="KAG"
              width={40}
              height={40}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-sm text-sidebar-foreground leading-tight">
              KAG
            </p>
            <p className="text-xs text-sidebar-foreground/50 mt-0.5">Management Portal</p>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="py-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/40 text-[10px] uppercase tracking-widest px-4 mb-1">
            Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5 px-2">
              {visibleItems.map((item) => {
                const active = isActive(item);
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      className="relative h-9 cursor-pointer"
                    >
                      <Link href={item.url} className="flex items-center gap-3">
                        <item.icon className="w-4 h-4 shrink-0" />
                        <span className="text-sm font-medium">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* User footer */}
      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-orange-500 flex items-center justify-center shrink-0 ring-2 ring-orange-400/30">
            <span className="text-white text-sm font-bold">
              {userName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-sidebar-foreground truncate leading-tight">
              {userName}
            </p>
            <p className="text-[11px] text-sidebar-foreground/50 truncate mt-0.5">
              {userEmail}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Badge
            variant="outline"
            className={`text-[10px] px-2 py-0.5 border font-medium ${ROLE_COLORS[role]}`}
          >
            {ROLE_LABELS[role]}
          </Badge>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-1.5 text-xs text-sidebar-foreground/50 hover:text-orange-300 transition-colors duration-150 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
