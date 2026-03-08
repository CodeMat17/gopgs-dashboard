import { v } from "convex/values";
import sanitizeHtml from "sanitize-html";
import { generateSlug } from "../lib/slugUtils";
import { mutation, query } from "./_generated/server";

// ── Writings ──────────────────────────────────────────────────────────────────

export const getPostgradPenList = query({
  handler: async (ctx) => {
    return await ctx.db.query("postgradPen").order("desc").collect();
  },
});

export const getPostgradPenBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    return await ctx.db
      .query("postgradPen")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();
  },
});

export const addPostgradPen = mutation({
  args: {
    title: v.string(),
    author: v.string(),
    content: v.string(),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const slug = generateSlug(args.title);
    const existing = await ctx.db
      .query("postgradPen")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();
    if (existing) throw new Error("A piece with this title already exists");

    const cleanContent = sanitizeHtml(args.content, {
      allowedTags: ["p", "strong", "em", "u", "h2", "h3", "ul", "ol", "li", "blockquote", "a"],
      allowedAttributes: { a: ["href", "target", "rel"] },
    });

    return await ctx.db.insert("postgradPen", {
      title: args.title,
      slug,
      content: cleanContent,
      author: args.author,
      category: args.category,
      views: 0,
    });
  },
});

export const updatePostgradPen = mutation({
  args: {
    id: v.id("postgradPen"),
    title: v.optional(v.string()),
    author: v.optional(v.string()),
    content: v.optional(v.string()),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("Writing not found");

    const patch: Record<string, unknown> = { updatedOn: Date.now() };
    if (args.title !== undefined) {
      patch.title = args.title;
      if (args.title !== existing.title) patch.slug = generateSlug(args.title);
    }
    if (args.author !== undefined) patch.author = args.author;
    if (args.content !== undefined) {
      patch.content = sanitizeHtml(args.content, {
        allowedTags: ["p", "strong", "em", "u", "h2", "h3", "ul", "ol", "li", "blockquote", "a"],
        allowedAttributes: { a: ["href", "target", "rel"] },
      });
    }
    if (args.category !== undefined) patch.category = args.category;

    await ctx.db.patch(args.id, patch);
  },
});

export const deletePostgradPen = mutation({
  args: { id: v.id("postgradPen") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});

export const incrementPenViews = mutation({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const doc = await ctx.db
      .query("postgradPen")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();
    if (doc) await ctx.db.patch(doc._id, { views: doc.views + 1 });
  },
});

// ── Spotlight ─────────────────────────────────────────────────────────────────

export const getSpotlights = query({
  handler: async (ctx) => {
    return await ctx.db.query("postgradSpotlight").order("desc").collect();
  },
});

export const addSpotlight = mutation({
  args: {
    name: v.string(),
    program: v.string(),
    faculty: v.string(),
    bio: v.string(),
    achievement: v.optional(v.string()),
    storageIds: v.array(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const photos = await Promise.all(
      args.storageIds.map(async (storageId) => {
        const url = await ctx.storage.getUrl(storageId);
        if (!url) throw new Error("Failed to resolve photo URL");
        return { url, storageId };
      })
    );

    return await ctx.db.insert("postgradSpotlight", {
      name: args.name,
      program: args.program,
      faculty: args.faculty,
      bio: args.bio,
      achievement: args.achievement,
      photos,
    });
  },
});

export const updateSpotlight = mutation({
  args: {
    id: v.id("postgradSpotlight"),
    name: v.optional(v.string()),
    program: v.optional(v.string()),
    faculty: v.optional(v.string()),
    bio: v.optional(v.string()),
    achievement: v.optional(v.string()),
    storageIds: v.optional(v.array(v.id("_storage"))),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("Spotlight not found");

    const patch: Record<string, unknown> = {};
    if (args.name !== undefined) patch.name = args.name;
    if (args.program !== undefined) patch.program = args.program;
    if (args.faculty !== undefined) patch.faculty = args.faculty;
    if (args.bio !== undefined) patch.bio = args.bio;
    if (args.achievement !== undefined) patch.achievement = args.achievement;

    if (args.storageIds && args.storageIds.length > 0) {
      const photos = await Promise.all(
        args.storageIds.map(async (storageId) => {
          const url = await ctx.storage.getUrl(storageId);
          if (!url) throw new Error("Failed to resolve photo URL");
          return { url, storageId };
        })
      );
      patch.photos = photos;
    }

    await ctx.db.patch(args.id, patch);
  },
});

export const deleteSpotlight = mutation({
  args: { id: v.id("postgradSpotlight") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});
