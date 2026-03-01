// convex/news.ts
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
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
      images: doc.images,
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
    storageIds: v.optional(v.array(v.id("_storage"))),
  },
  handler: async (ctx, args) => {
    const slug = args.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60);

    // Resolve all storageIds to URLs
    const images: { url: string; storageId: Id<"_storage"> }[] = [];
    if (args.storageIds && args.storageIds.length > 0) {
      for (const storageId of args.storageIds) {
        const url = await ctx.storage.getUrl(storageId);
        if (url) {
          images.push({ url, storageId });
        }
      }
    }

    const coverImage = images.length > 0 ? images[0].url : "";

    await ctx.db.insert("news", {
      title: args.title,
      slug,
      author: args.author,
      content: args.content,
      coverImage,
      images: images.length > 0 ? images : undefined,
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
    storageIds: v.optional(v.array(v.id("_storage"))),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);
    if (!existing) {
      throw new Error("News item not found");
    }

    // Resolve new images if provided, otherwise keep existing
    let images = existing.images;
    let coverImage = existing.coverImage;

    if (args.storageIds && args.storageIds.length > 0) {
      const resolved: { url: string; storageId: Id<"_storage"> }[] = [];
      for (const storageId of args.storageIds) {
        const url = await ctx.storage.getUrl(storageId);
        if (url) {
          resolved.push({ url, storageId });
        }
      }
      if (resolved.length > 0) {
        images = resolved;
        coverImage = resolved[0].url;
      }
    }

    await ctx.db.patch(args.id, {
      title: args.title,
      author: args.author,
      content: args.content,
      coverImage,
      images,
      updatedOn: new Date().toISOString(),
    });
  },
});

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});
