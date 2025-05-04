// convex/materials.ts
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { courseType, facultyType } from "./schema";

export const getAllGPC = query({
  handler: async (ctx) => {
    return await ctx.db.query("gpc").collect();
  },
});

export const getGPCByFacultyType = query({
  args: {
    faculty: facultyType,
    type: courseType,
  },
  handler: async ({ db }, args) => {
    return await db
      .query("gpc")
      .withIndex("by_faculty_type", (q) =>
        q.eq("faculty", args.faculty).eq("type", args.type)
      )
      .collect();
  },
});

export const addGPC = mutation({
  args: {
    faculty: facultyType,
    type: courseType, // Should match schema definition
    title: v.string(),
    description: v.string(),
    storageId: v.id("_storage"),
    semester: v.union(v.literal(1), v.literal(2)),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("gpc", {
      faculty: args.faculty,
      type: args.type,
      title: args.title,
      description: args.description,
      semester: args.semester,
      file: args.storageId, // Match schema field name
    });
  },
});

export const updateGPC = mutation({
  args: {
    id: v.id("gpc"),
    faculty: v.optional(facultyType),
    type: v.optional(courseType),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    semester: v.union(v.literal(1), v.literal(2)),
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
      semester:
        args.semester === 1 || args.semester === 2
          ? args.semester
          : existing.semester,
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

export const deleteGPC = mutation({
  args: { id: v.id("gpc") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});

// Query to get download URL
export const getDownloadUrl = query({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const url = await ctx.storage.getUrl(args.storageId);
    if (!url) throw new Error("File not found");
    return url;
  },
});

// Mutation to track downloads (if needed)

export const trackDownload = mutation({
  args: {
    materialId: v.id("gpc"),
  },
  handler: async (ctx, args) => {
    const material = await ctx.db.get(args.materialId);
    if (!material) throw new Error("Material not found");

    // Handle potentially undefined downloads field
    const currentDownloads = material.downloads ?? 0;

    await ctx.db.patch(args.materialId, {
      downloads: currentDownloads + 1,
    });

    return currentDownloads + 1;
  },
});