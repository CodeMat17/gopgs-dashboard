import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ── Queries ────────────────────────────────────────────────────────────────

export const getAllTimetables = query({
  handler: async (ctx) => {
    return await ctx.db.query("examTimetable").order("desc").collect();
  },
});

export const getTimetableUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, { storageId }) => {
    return await ctx.storage.getUrl(storageId);
  },
});

// ── Mutations ──────────────────────────────────────────────────────────────

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const uploadTimetable = mutation({
  args: {
    title: v.string(),
    semester: v.optional(v.union(v.literal(1), v.literal(2))),
    description: v.optional(v.string()),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("examTimetable", {
      title: args.title,
      semester: args.semester,
      description: args.description,
      file: args.storageId,
      uploadedAt: Date.now(),
      downloads: 0,
    });
  },
});

export const updateTimetable = mutation({
  args: {
    id: v.id("examTimetable"),
    title: v.optional(v.string()),
    semester: v.optional(v.union(v.literal(1), v.literal(2))),
    description: v.optional(v.string()),
    storageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("Timetable not found");

    const patch: Record<string, unknown> = {};
    if (args.title !== undefined) patch.title = args.title;
    if (args.semester !== undefined) patch.semester = args.semester;
    if (args.description !== undefined) patch.description = args.description;
    if (args.storageId !== undefined) {
      patch.file = args.storageId;
      patch.uploadedAt = Date.now();
    }

    await ctx.db.patch(args.id, patch);
  },
});

export const deleteTimetable = mutation({
  args: { id: v.id("examTimetable") },
  handler: async (ctx, { id }) => {
    const doc = await ctx.db.get(id);
    if (!doc) throw new Error("Timetable not found");
    await ctx.storage.delete(doc.file);
    await ctx.db.delete(id);
  },
});

export const trackDownload = mutation({
  args: { id: v.id("examTimetable") },
  handler: async (ctx, { id }) => {
    const doc = await ctx.db.get(id);
    if (!doc) throw new Error("Timetable not found");
    await ctx.db.patch(id, { downloads: (doc.downloads ?? 0) + 1 });
  },
});
