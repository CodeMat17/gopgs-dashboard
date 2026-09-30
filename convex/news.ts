// convex/news.ts
import { v } from "convex/values";
import { Doc } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import {
  deleteOrphanedPhotos,
  galleryPhoto,
  GalleryPhoto,
  removedPhotos,
  resolveGallery,
} from "./cloudinary";

/** A news item's photos, including the legacy single-cover shape. */
const photosOf = (news: Doc<"news">): GalleryPhoto[] =>
  news.images ??
  (news.coverImage
    ? [{ url: news.coverImage, storageId: news.storageId }]
    : []);

// Legacy cover file some old items keep outside `images`.
const legacyCover = (news: Doc<"news">) =>
  news.images && news.storageId ? [{ storageId: news.storageId }] : [];

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
    const existing = await ctx.db.get(id);
    if (!existing) return;
    await ctx.db.delete(id);
    await deleteOrphanedPhotos(ctx, [
      ...photosOf(existing),
      ...legacyCover(existing),
    ]);
  },
});

export const addNews = mutation({
  args: {
    title: v.string(),
    author: v.string(),
    content: v.string(),
    // Cloudinary photos, first is the cover.
    images: v.array(galleryPhoto),
  },
  handler: async (ctx, args) => {
    const slug = args.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60);

    const images = resolveGallery(args.images, [], "news");

    await ctx.db.insert("news", {
      title: args.title,
      slug,
      author: args.author,
      content: args.content,
      coverImage: images[0]?.url ?? "",
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
    // The full photo list after editing, first is the cover. Existing photos
    // are matched by url; new ones must be Cloudinary uploads.
    images: v.array(galleryPhoto),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);
    if (!existing) {
      throw new Error("News item not found");
    }

    const before = photosOf(existing);
    const images = resolveGallery(args.images, before, "news");

    // Patching a field to undefined removes it from the document.
    await ctx.db.patch(args.id, {
      title: args.title,
      author: args.author,
      content: args.content,
      coverImage: images[0]?.url ?? "",
      images: images.length > 0 ? images : undefined,
      storageId: undefined,
      updatedOn: new Date().toISOString(),
    });

    const stillUsed = new Set(images.map((p) => p.storageId));
    await deleteOrphanedPhotos(ctx, [
      ...removedPhotos(before, images),
      ...legacyCover(existing).filter((f) => !stillUsed.has(f.storageId)),
    ]);
  },
});
