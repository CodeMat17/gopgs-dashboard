import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getFaculties = query({
  handler: async (ctx) => {
    return await ctx.db.query("faculties").order("asc").collect();
  },
});

export const addFaculty = mutation({
  args: { name: v.string() },
  handler: async (ctx, { name }) => {
    const trimmed = name.trim();
    if (!trimmed) throw new Error("Faculty name cannot be empty");

    const existing = await ctx.db
      .query("faculties")
      .withIndex("by_name", (q) => q.eq("name", trimmed))
      .first();

    if (existing) throw new Error("Faculty already exists");

    return await ctx.db.insert("faculties", { name: trimmed });
  },
});

export const deleteFaculty = mutation({
  args: { id: v.id("faculties") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
