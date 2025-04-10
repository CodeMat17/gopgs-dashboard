"use client";

import { motion, type MotionProps } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

const MotionButton = motion.button as React.ComponentType<
  MotionProps & React.ButtonHTMLAttributes<HTMLButtonElement>
>;

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <MotionButton
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className='p-2 rounded-full bg-gray-400 dark:bg-gray-800/40'>
      {theme === "dark" ? (
        <Sun className='h-6 w-6 text-[#FEDA37]' />
      ) : (
        <Moon className='h-6 w-6' />
      )}
    </MotionButton>
  );
}
