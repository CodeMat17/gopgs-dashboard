// convex/revalidate.ts
// Tells the Next.js site to regenerate the ISR pages that read changed data.
// Requires these Convex env vars (npx convex env set NAME value):
//   SITE_URL (e.g. https://pg.gouni.edu.ng), REVALIDATE_SECRET
// Tags must match the go-pgs site (lib/server-data.ts). Prefer the narrowest
// tag: each one rebuilds only the pages that read it, and every rebuild costs
// Vercel ISR writes. "news"/"courses" rebuild every article/course page.
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { internalAction, type MutationCtx } from "./_generated/server";

type SiteTag =
  | "news"
  | "news-list"
  | `news:${string}`
  | "courses"
  | "courses-list"
  | `course:${string}`
  | "faculties"
  | "how-to-apply"
  | "mission"
  | "vision";

export const notifySite = internalAction({
  // Typed by SiteTag at the call site; the site rejects anything it doesn't know.
  args: { tags: v.array(v.string()) },
  handler: async (_ctx, { tags }) => {
    const siteUrl = process.env.SITE_URL;
    const secret = process.env.REVALIDATE_SECRET;
    if (!siteUrl || !secret) {
      console.warn("SITE_URL/REVALIDATE_SECRET not set; skipping revalidation");
      return;
    }

    const res = await fetch(`${siteUrl.replace(/\/$/, "")}/api/revalidate`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${secret}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ tags }),
    });
    if (!res.ok) {
      throw new Error(`Revalidation failed (${res.status}): ${await res.text()}`);
    }
  },
});

/** Schedule site revalidation; runs only if the calling mutation commits. */
export const revalidateSite = (
  ctx: MutationCtx,
  tags: SiteTag[],
) => ctx.scheduler.runAfter(0, internal.revalidate.notifySite, { tags });
