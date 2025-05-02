// convex/materials.ts
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { courseType, facultyType } from "./schema";

export const getAll = query({
  handler: async (ctx) => {
    return await ctx.db.query("materials").collect();
  },
});

export const getMaterialsByFacultyType = query({
  args: {
    faculty: facultyType,
    type: courseType,
  },
  handler: async ({ db }, args) => {
    return await db
      .query("materials")
      .withIndex("by_faculty_type", (q) =>
        q.eq("faculty", args.faculty).eq("type", args.type)
      )
      .collect();
  },
});

export const addMaterial = mutation({
  args: {
    faculty: facultyType,
    type: courseType, // Should match schema definition
    title: v.string(),
    description: v.string(),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("materials", {
      faculty: args.faculty,
      type: args.type,
      title: args.title,
      description: args.description,
      file: args.storageId, // Match schema field name
    });
  },
});

// convex/materials.ts
export const updateCourse = mutation({
  args: {
    id: v.id("materials"),
    faculty: v.optional(facultyType),
    type: v.optional(courseType),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    file: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    // Get existing document
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("Document not found");

    // Merge existing data with updates
    await ctx.db.patch(args.id, {
      faculty: args.faculty ?? existing.faculty,
      type: args.type ?? existing.type,
      title: args.title ?? existing.title,
      description: args.description ?? existing.description,
      file: args.file ?? existing.file,
    });
  },
});

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const downloadFile = mutation({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    // Get download URL for the stored file
    const url = await ctx.storage.getUrl(args.storageId);

    if (!url) {
      throw new Error("File not found");
    }

    return url;
  },
});

export const deleteCourse = mutation({
  args: { id: v.id("materials") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});