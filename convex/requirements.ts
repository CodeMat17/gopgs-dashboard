import { query } from "./_generated/server";



export const getRequirements = query({
  handler: async (ctx) => {
    return await ctx.db.query("admissionRequirements").collect();
  },
});
