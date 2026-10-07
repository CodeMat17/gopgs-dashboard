// convex/revalidate.ts
// Tells the Next.js site to regenerate the ISR pages that read changed data.
// Requires these Convex env vars (npx convex env set NAME value):
//   SITE_URL (e.g. https://pg.gouni.edu.ng), REVALIDATE_SECRET
// Tags must match CACHE_TAGS in the go-pgs site (lib/server-data.ts).
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { internalAction, type MutationCtx } from "./_generated/server";

export const siteTag = v.union(
  v.literal("news"),
  v.literal("courses"),
  v.literal("faculties"),
  v.literal("how-to-apply"),
  v.literal("mission"),
  v.literal("vision"),
);

export const notifySite = internalAction({
  args: { tags: v.array(siteTag) },
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
  tags: (typeof siteTag.type)[],
) => ctx.scheduler.runAfter(0, internal.revalidate.notifySite, { tags });
