// components/theme/theme-provider.tsx
"use client";

import { ThemeProvider as NextThemes } from "next-themes";
import type { ThemeProviderProps } from "next-themes"; // Remove /dist/types
import { ReactNode } from "react";

interface ExtendedThemeProviderProps extends ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({
  children,
  ...props
}: ExtendedThemeProviderProps) {
  return <NextThemes {...props}>{children}</NextThemes>;
}
 