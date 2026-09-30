"use client";

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
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { isActivePath, navGroups } from "@/lib/navigation";
import { ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const PUBLIC_SITE_URL = "https://pg.gouni.edu.ng";

export function AppSidebar() {
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();

  // Close the mobile drawer after navigating.
  const handleNavigate = () => {
    if (isMobile) setOpenMobile(false);
  };

  return (
    <Sidebar collapsible='icon'>
      <SidebarHeader className='border-b border-sidebar-border'>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size='lg' asChild tooltip='GOUNI SPGS Admin'>
              <Link href='/' onClick={handleNavigate}>
                <Image
                  src='/go_logo.jpg'
                  alt='GOUNI logo'
                  width={32}
                  height={32}
                  className='size-8 shrink-0 rounded-full ring-2 ring-gold/60'
                />
                <div className='grid flex-1 text-left leading-tight'>
                  <span className='truncate text-sm font-bold text-white'>
                    GOUNI SPGS
                  </span>
                  <span className='truncate text-xs text-sidebar-foreground/70'>
                    Content Management
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {navGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className='text-[11px] uppercase tracking-widest text-sidebar-foreground/50'>
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActivePath(pathname, item.url)}
                      tooltip={item.title}
                      className='data-[active=true]:bg-gold data-[active=true]:font-semibold data-[active=true]:text-gold-foreground'>
                      <Link href={item.url} onClick={handleNavigate}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className='border-t border-sidebar-border'>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip='View public site'>
              <a href={PUBLIC_SITE_URL} target='_blank' rel='noopener noreferrer'>
                <ExternalLink />
                <span>View public site</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
