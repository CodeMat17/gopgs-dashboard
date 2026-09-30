"use client";

import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <Button
      variant='ghost'
      size='icon'
      className='relative size-9 rounded-full'
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      aria-label='Toggle theme'>
      <Sun className='size-[18px] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0' />
      <Moon className='absolute size-[18px] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100' />
    </Button>
  );
}
