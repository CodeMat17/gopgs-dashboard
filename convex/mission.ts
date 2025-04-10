import { v } from 'convex/values';
import {mutation, query } from './_generated/server'

export const getMission = query({
    handler: async (ctx) => {
        return await ctx.db.query('mission').collect()
    }
})

// Mutation to update a mission
export const updateMission = mutation({
  args: {
    _id: v.id("mission"), // Correct type for mission ID
    title: v.string(),
    desc: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args._id, {
      title: args.title,
      desc: args.desc,
    });
  },
});