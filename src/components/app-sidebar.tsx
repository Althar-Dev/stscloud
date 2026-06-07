
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Server as ServerIcon,
  Cpu,
  ShieldCheck,
  LogOut,
  Zap,
  Rocket,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";

const mainNavItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: Rocket, label: "Deploy Server", href: "/deploy" },
];

const infrastructureItems = [
  { icon: ServerIcon, label: "All Servers", href: "/servers" },
  { icon: Cpu, label: "Node Health", href: "/nodes" },
  { icon: ShieldCheck, label: "Security", href: "/security" },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" className="border-r border-border/50 bg-sidebar">
      <SidebarHeader className="h-16 flex items-center border-b border-border/50 px-4 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center">
        <Link href="/" className="flex items-center justify-center gap-3 w-full">
          <div className="size-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
            <Zap className="size-5 text-primary-foreground fill-primary-foreground" />
          </div>
          <span className="font-headline font-bold text-xl tracking-tight group-data-[collapsible=icon]:hidden truncate">
            STS<span className="text-primary">Cloud</span>
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden uppercase tracking-widest text-[10px] font-bold">General</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={pathname === item.href} tooltip={item.label}>
                    <Link href={item.href}>
                      <item.icon className={pathname === item.href ? "text-primary" : ""} />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden uppercase tracking-widest text-[10px] font-bold">System</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {infrastructureItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={pathname === item.href} tooltip={item.label}>
                    <Link href={item.href}>
                      <item.icon className={pathname === item.href ? "text-primary" : ""} />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-border/50 p-4 bg-secondary/10">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="text-muted-foreground hover:text-destructive transition-colors">
              <LogOut className="rotate-180" />
              <span>Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
