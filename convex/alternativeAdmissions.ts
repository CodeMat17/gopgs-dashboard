import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
// import { Id } from "@/convex/_generated/dataModel";

export const getAlternativeAdmissionRoute = query({
  handler: async (ctx) => {
    return await ctx.db.query("alternativeAdmissions").collect();
  },
});

// Mutation to update a vision
export const updateOtherRoutes = mutation({
  args: {
    _id: v.id("alternativeAdmissions"), // Correct type for vision ID
    title: v.string(),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args._id, {
      title: args.title,
      description: args.description,
    });
  },
});

export const addAlternativeAdmissionRoute = mutation({
  args: { title: v.string(), description: v.string() },
  handler: async (ctx, { title, description }) => {
    const newRouteId = await ctx.db.insert("alternativeAdmissions", {
      title,
      description,
    });

    return newRouteId;
  },
});

export const removeAlternativeAdmissionRoute = mutation({
  args: {
    _id: v.id("alternativeAdmissions"),
  },

  handler: async (ctx, { _id }) => {
    await ctx.db.delete(_id);
  },
});
