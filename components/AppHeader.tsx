"use client";

import ThemeToggle from "@/components/theme/theme-toggle";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { findNavItem } from "@/lib/navigation";
import { SignedIn, UserButton } from "@clerk/nextjs";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function AppHeader() {
  const pathname = usePathname();
  const current = findNavItem(pathname);
  const isHome = pathname === "/";

  return (
    <header className='sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b bg-background/80 px-3 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:px-4'>
      <SidebarTrigger className='-ml-1' />
      <Separator orientation='vertical' className='mr-1 h-5' />

      <nav aria-label='Breadcrumb' className='flex min-w-0 items-center gap-1.5 text-sm'>
        <Link
          href='/'
          className={
            isHome
              ? "font-semibold text-foreground"
              : "text-muted-foreground transition-colors hover:text-foreground"
          }>
          Dashboard
        </Link>
        {!isHome && current && (
          <>
            <ChevronRight className='size-3.5 shrink-0 text-muted-foreground' />
            <span className='truncate font-semibold text-foreground'>
              {current.title}
            </span>
          </>
        )}
      </nav>

      <div className='ml-auto flex items-center gap-2'>
        <ThemeToggle />
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
    </header>
  );
}
