// convex/getAllContent.ts
import { query } from "./_generated/server";

export const getAllContent = query({
  handler: async (ctx) => {
    const hero = await ctx.db.query("hero").collect();
    const vision = await ctx.db.query("vision").collect();
    const mission = await ctx.db.query("mission").collect();
    const programs = await ctx.db.query("programs").collect();
    const alumni = await ctx.db.query("alumni").collect();
    const staff = await ctx.db.query("staff").collect();

    return {
      hero,
      vision,
      mission,
      programs,
      alumni,
      staff,
    };
  },
});
