import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Readable reason from a failed Convex call or upload, without Convex's
 * "[CONVEX M(...)] [Request ID: ...] Server Error Uncaught Error:" prefix and
 * the server stack trace.
 */
export function errorMessage(error: unknown): string {
  const raw = error instanceof Error ? error.message : String(error)
  return (
    raw
      .replace(/^\[CONVEX [^\]]*\]\s*(\[Request ID: [^\]]*\]\s*)?/, "")
      .replace(/^Server Error\s*/, "")
      .replace(/^Uncaught \w*Error:\s*/, "")
      .split(/\n\s+at /)[0]
      .trim() || "Unknown error"
  )
}
