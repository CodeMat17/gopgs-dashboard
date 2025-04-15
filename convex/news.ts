// convex/news.ts
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getNewsList = query({
  handler: async (ctx) => {
    const results = await ctx.db.query("news").order("desc").take(100);

    return results.map((doc) => ({
      _id: doc._id,
      _creationTime: doc._creationTime,
      title: doc.title,
      slug: doc.slug,
      coverImage: doc.coverImage,
      author: doc.author,
      views: doc.views,
      updatedOn: doc.updatedOn,
    }));
  },
});

export const getNewsBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    return await ctx.db
      .query("news")
      .filter((q) => q.eq(q.field("slug"), slug))
      .unique();
  },
});

export const incrementViews = mutation({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const newsItem = await ctx.db
      .query("news")
      .filter((q) => q.eq(q.field("slug"), slug))
      .unique();

    if (newsItem) {
      await ctx.db.patch(newsItem._id, { views: (newsItem.views || 0) + 1 });
    }
  },
});

export const deleteNews = mutation({
  args: { id: v.id("news") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});

export const addNews = mutation({
  args: {
    title: v.string(),
    author: v.string(),
    content: v.string(),
    storageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const slug = args.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60);

    const coverImage = args.storageId
      ? (await ctx.storage.getUrl(args.storageId)) || ""
      : "";

    await ctx.db.insert("news", {
      title: args.title,
      slug,
      author: args.author,
      content: args.content,
      coverImage,
      views: 0,
    });
  },
});

export const updateNews = mutation({
  args: {
    id: v.id("news"),
    title: v.string(),
    author: v.string(),
    content: v.string(),
    storageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);
    if (!existing) {
      throw new Error("News item not found");
    }

    let coverImage: string | undefined = existing.coverImage

     if (args.storageId && args.storageId !== existing.storageId) {
       const url = await ctx.storage.getUrl(args.storageId);
       if (url) { coverImage = url };
     }

    await ctx.db.patch(args.id, {
      title: args.title,
      author: args.author,
      content: args.content,
      coverImage,
      storageId: args.storageId ?? existing.storageId,
      updatedOn: new Date().toISOString()
    });
  },
});

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});