import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { revalidateSite } from "./revalidate";

export const updateMission = mutation({
  args: {
    _id: v.id("mission"), // ✅ Use _id instead of id
    title: v.string(),
    desc: v.string(),
  },
  async handler(ctx, { _id, title, desc }) {
    await ctx.db.patch(_id, { title, desc });
    await revalidateSite(ctx, ["mission"]);
  },
});

export const updateVision = mutation({
  args: {
    _id: v.id("vision"),
    title: v.string(),
    desc: v.string(),
  },
  async handler(ctx, { _id, title, desc }) {
    await ctx.db.patch(_id, { title, desc });
    await revalidateSite(ctx, ["vision"]);
  },
});

export const updateRequirements = mutation({
  args: {
    id: v.id("admissionRequirements"),
    title: v.string(),
    requirements: v.array(v.string()),
  },
  handler: async (ctx, { id, title, requirements }) => {
    await ctx.db.patch(id, { title, requirements });
  },
});

export const deleteRequirement = mutation({
  args: {
    id: v.id("admissionRequirements"),
  },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});

export const updateOtherRoutes = mutation({
  args: {
    _id: v.id("alternativeAdmissions"),
    title: v.string(),
    description: v.string(),
  },
  async handler(ctx, { _id, title, description }) {
    await ctx.db.patch(_id, { title, description });
  },
});