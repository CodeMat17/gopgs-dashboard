// convex/imageMigration.ts
// One-off seed: copies every photo from Convex storage to Cloudinary and
// rewrites the documents to point at Cloudinary.
//
//   npx convex run imageMigration:migrateAll '{"dryRun": true}'
//   npx convex run imageMigration:migrateAll
//   npx convex run imageMigration:migrateAll '{"deleteFromConvex": true}'
//
// Per table: migrateNews, migrateStaff, migrateAlumni, migrateSpotlight (same args).
//
// Safe to re-run: photos that already have a publicId are skipped, and
// public_ids are derived from the slug/document id so re-uploads overwrite
// rather than duplicate. Convex storage files are only deleted with
// deleteFromConvex, after the document no longer references them.
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { Doc, Id } from "./_generated/dataModel";
import {
  ActionCtx,
  internalAction,
  internalMutation,
  internalQuery,
} from "./_generated/server";
import { FOLDERS, uploadFromUrl } from "./cloudinary";

const tables = v.union(
  v.literal("news"),
  v.literal("staff"),
  v.literal("alumni"),
  v.literal("postgradSpotlight"),
);

const isConvexUrl = (url?: string) => !!url && /\.convex\.(cloud|site)\//.test(url);
const CONVEX_IMG_SRC = /(<img\b[^>]*?\bsrc=["'])(https:\/\/[^"']+\.convex\.(?:cloud|site)\/[^"']+)(["'])/gi;

type Photo = { url: string; publicId?: string; storageId?: Id<"_storage"> };

export const listAll = internalQuery({
  args: { table: tables },
  handler: async (ctx, { table }) => await ctx.db.query(table).collect(),
});

export const applyPatch = internalMutation({
  args: {
    id: v.string(),
    table: tables,
    patch: v.any(),
    // Field names to remove (undefined can't be sent as an argument value).
    unset: v.array(v.string()),
  },
  handler: async (ctx, { id, table, patch, unset }) => {
    const docId = ctx.db.normalizeId(table, id);
    if (!docId) throw new Error(`Invalid ${table} id ${id}`);
    for (const field of unset) patch[field] = undefined;
    await ctx.db.patch(docId, patch);
  },
});

const migrationArgs = {
  dryRun: v.optional(v.boolean()),
  deleteFromConvex: v.optional(v.boolean()),
};

class Migrator {
  uploaded = 0;
  failed = 0;
  changedDocs = 0;
  deletedFromConvex = 0;
  failures: string[] = [];

  constructor(
    private ctx: ActionCtx,
    readonly dryRun: boolean,
    readonly deleteFromConvex: boolean,
  ) {}

  /** Fresh URL for a storage id; null if it doesn't exist on this deployment. */
  async storageUrl(storageId?: string) {
    if (!storageId) return null;
    try {
      return await this.ctx.storage.getUrl(storageId as Id<"_storage">);
    } catch {
      return null;
    }
  }

  async upload(label: string, sourceUrl: string, publicId: string) {
    if (this.dryRun) {
      console.log(`[dry run] ${label}: ${sourceUrl} -> ${publicId}`);
      return null;
    }
    try {
      const result = await uploadFromUrl(sourceUrl, publicId);
      this.uploaded++;
      return result;
    } catch (err) {
      this.failed++;
      this.failures.push(`${label}: ${sourceUrl} (${(err as Error).message})`);
      return null;
    }
  }

  /** Upload a gallery; strips storageId from photos when deleting from Convex. */
  async migratePhotos(label: string, photos: Photo[], publicIdBase: string) {
    const moved = new Map<string, string>();
    const toDelete: string[] = [];
    let changed = false;
    const next: Photo[] = [];
    for (const [i, photo] of photos.entries()) {
      let updated = { ...photo };
      if (!photo.publicId) {
        const source = (await this.storageUrl(photo.storageId)) || photo.url;
        const result = await this.upload(label, source, `${publicIdBase}-${i}`);
        if (result) {
          moved.set(photo.url, result.url);
          updated = { ...updated, ...result };
          changed = true;
        }
      }
      if (this.deleteFromConvex && updated.publicId && updated.storageId) {
        toDelete.push(updated.storageId);
        delete updated.storageId;
        changed = true;
      }
      next.push(updated);
    }
    return { photos: next, moved, toDelete, changed };
  }

  async save(
    table: "news" | "staff" | "alumni" | "postgradSpotlight",
    id: string,
    patch: Record<string, unknown>,
    unset: string[],
    toDelete: (string | undefined)[],
  ) {
    await this.ctx.runMutation(internal.imageMigration.applyPatch, {
      table,
      id,
      patch,
      unset,
    });
    this.changedDocs++;
    for (const storageId of new Set(toDelete.filter(Boolean) as string[])) {
      try {
        await this.ctx.storage.delete(storageId as Id<"_storage">);
        this.deletedFromConvex++;
      } catch (err) {
        console.warn(`${table} ${id}: could not delete ${storageId}`, err);
      }
    }
  }

  summary(table: string, docs: number) {
    if (this.failures.length) {
      console.warn(`${table} failed uploads:\n` + this.failures.join("\n"));
    }
    return {
      table,
      docs,
      uploaded: this.uploaded,
      failed: this.failed,
      changedDocs: this.changedDocs,
      deletedFromConvex: this.deletedFromConvex,
      failures: this.failures,
    };
  }
}

type Opts = { dryRun?: boolean; deleteFromConvex?: boolean };

async function runNews(ctx: ActionCtx, { dryRun = false, deleteFromConvex = false }: Opts) {
  const m = new Migrator(ctx, dryRun, deleteFromConvex);
  const docs = (await ctx.runQuery(internal.imageMigration.listAll, {
    table: "news",
  })) as Doc<"news">[];

  for (const doc of docs) {
    const label = `news/${doc.slug}`;
    const gallery = await m.migratePhotos(
      label,
      doc.images ?? [],
      `${FOLDERS.news}/${doc.slug}`,
    );
    let changed = gallery.changed;
    const { moved, toDelete } = gallery;

    // Cover image (normally images[0], but older docs may only have coverImage)
    let coverImage = doc.coverImage;
    if (isConvexUrl(coverImage)) {
      const reused = moved.get(coverImage);
      const result = reused
        ? { url: reused }
        : await m.upload(
            label,
            (await m.storageUrl(doc.storageId)) || coverImage,
            `${FOLDERS.news}/${doc.slug}-cover`,
          );
      if (result) {
        moved.set(coverImage, result.url);
        coverImage = result.url;
        changed = true;
      }
    }
    const unset: string[] = [];
    if (deleteFromConvex && doc.storageId && !isConvexUrl(coverImage)) {
      toDelete.push(doc.storageId);
      unset.push("storageId");
      changed = true;
    }

    // Inline <img> tags in the article body
    let content = doc.content;
    const inline = [...content.matchAll(CONVEX_IMG_SRC)].map((match) => match[2]);
    for (const [n, src] of [...new Set(inline)].entries()) {
      const target =
        moved.get(src) ??
        (await m.upload(label, src, `${FOLDERS.news}/${doc.slug}-inline-${n}`))?.url;
      if (target) {
        content = content.split(src).join(target);
        changed = true;
      }
    }

    if (!changed || dryRun) continue;
    await m.save(
      "news",
      doc._id,
      { coverImage, content, ...(doc.images ? { images: gallery.photos } : {}) },
      unset,
      toDelete,
    );
  }
  return m.summary("news", docs.length);
}

async function runStaff(ctx: ActionCtx, { dryRun = false, deleteFromConvex = false }: Opts) {
  const m = new Migrator(ctx, dryRun, deleteFromConvex);
  const docs = (await ctx.runQuery(internal.imageMigration.listAll, {
    table: "staff",
  })) as Doc<"staff">[];

  for (const doc of docs) {
    const label = `staff/${doc.name}`;
    const patch: Record<string, unknown> = {};
    let publicId = doc.imagePublicId;

    if (!publicId) {
      const source =
        (await m.storageUrl(doc.body)) ||
        (await m.storageUrl(doc.imageStorageId)) ||
        (isConvexUrl(doc.image) ? doc.image : null);
      if (!source) continue; // no photo, or already an external/static URL
      const result = await m.upload(label, source, `${FOLDERS.staff}/${doc._id}`);
      if (result) {
        patch.image = result.url;
        patch.imagePublicId = publicId = result.publicId;
      }
    }

    const unset: string[] = [];
    const toDelete: (string | undefined)[] = [];
    if (deleteFromConvex && publicId) {
      if (doc.body) unset.push("body");
      if (doc.imageStorageId) unset.push("imageStorageId");
      toDelete.push(doc.body, doc.imageStorageId);
    }

    if (dryRun || (Object.keys(patch).length === 0 && unset.length === 0)) continue;
    await m.save("staff", doc._id, patch, unset, toDelete);
  }
  return m.summary("staff", docs.length);
}

async function runAlumni(ctx: ActionCtx, { dryRun = false, deleteFromConvex = false }: Opts) {
  const m = new Migrator(ctx, dryRun, deleteFromConvex);
  const docs = (await ctx.runQuery(internal.imageMigration.listAll, {
    table: "alumni",
  })) as Doc<"alumni">[];

  for (const doc of docs) {
    const label = `alumni/${doc.name}`;
    const patch: Record<string, unknown> = {};
    let publicId = doc.photoPublicId;

    if (!publicId) {
      const source =
        (await m.storageUrl(doc.storageId)) || (isConvexUrl(doc.photo) ? doc.photo : null);
      if (!source) continue; // no photo, or already an external URL
      const result = await m.upload(label, source, `${FOLDERS.alumni}/${doc._id}`);
      if (result) {
        patch.photo = result.url;
        patch.photoPublicId = publicId = result.publicId;
      }
    }

    const unset: string[] = [];
    if (deleteFromConvex && publicId && doc.storageId) unset.push("storageId");

    if (dryRun || (Object.keys(patch).length === 0 && unset.length === 0)) continue;
    await m.save("alumni", doc._id, patch, unset, unset.length ? [doc.storageId] : []);
  }
  return m.summary("alumni", docs.length);
}

async function runSpotlight(ctx: ActionCtx, { dryRun = false, deleteFromConvex = false }: Opts) {
  const m = new Migrator(ctx, dryRun, deleteFromConvex);
  const docs = (await ctx.runQuery(
    internal.imageMigration.listAll,
    { table: "postgradSpotlight" },
  )) as Doc<"postgradSpotlight">[];

  for (const doc of docs) {
    const { photos, toDelete, changed } = await m.migratePhotos(
      `spotlight/${doc.name}`,
      doc.photos,
      `${FOLDERS.spotlight}/${doc._id}`,
    );
    if (!changed || dryRun) continue;
    await m.save("postgradSpotlight", doc._id, { photos }, [], toDelete);
  }
  return m.summary("postgradSpotlight", docs.length);
}

export const migrateNews = internalAction({
  args: migrationArgs,
  handler: async (ctx, args) => await runNews(ctx, args),
});

export const migrateStaff = internalAction({
  args: migrationArgs,
  handler: async (ctx, args) => await runStaff(ctx, args),
});

export const migrateAlumni = internalAction({
  args: migrationArgs,
  handler: async (ctx, args) => await runAlumni(ctx, args),
});

export const migrateSpotlight = internalAction({
  args: migrationArgs,
  handler: async (ctx, args) => await runSpotlight(ctx, args),
});

export const migrateAll = internalAction({
  args: migrationArgs,
  handler: async (ctx, args) => [
    await runNews(ctx, args),
    await runStaff(ctx, args),
    await runAlumni(ctx, args),
    await runSpotlight(ctx, args),
  ],
});
