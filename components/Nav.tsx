"use client";

import { Logo } from "@/components/Logo";

import { motion } from "framer-motion";

import ThemeToggle from "./theme/theme-toggle";
import { SignedIn, UserButton } from "@clerk/nextjs";

export function Nav() {
  // Get the current route

  // Check if a link is active

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className='sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
      <div className='flex h-[68px] items-center justify-between px-4 sm:px-6 lg:px-8'>
        {/* Logo */}
        <Logo
          text_one='Godfrey Okoye University'
          text_two='Postgraduate School'
          classnames='sm:font-semibold'
          width={50}
          height={50}
        />

        <div className='flex items-center gap-3'>
          <ThemeToggle />
          <div className="flex items-center gap-4">
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
