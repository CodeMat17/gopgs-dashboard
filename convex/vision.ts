import { v } from 'convex/values';
import {mutation, query } from './_generated/server'

export const getVision = query({
    handler: async (ctx) => {
        return await ctx.db.query('vision').collect()
    }
})

// Mutation to update a vision
export const updateVision = mutation({
  args: {
    _id: v.id("vision"), // Correct type for vision ID
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