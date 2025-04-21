import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getAll = query({
  handler: async (ctx) => {
    return await ctx.db.query("howToApply").collect();
  },
});

export const updateHowToApply = mutation({
  args: {
    id: v.id("howToApply"),
    text: v.string(),
    link: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      text: args.text,
      link: args.link,
    });
  },
});
