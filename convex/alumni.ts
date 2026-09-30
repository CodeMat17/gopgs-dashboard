import { v } from "convex/values";
import { Doc } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import {
  assertCloudinaryImage,
  cloudinaryImage,
  deleteOrphanedPhotos,
} from "./cloudinary";

/** Every file that holds an alumnus's photo, Cloudinary or legacy Convex. */
const photoFiles = (alumnus: Doc<"alumni">) => [
  { publicId: alumnus.photoPublicId },
  { storageId: alumnus.storageId },
];

export const getAlumni = query({
  handler: async (ctx) => {
    return await ctx.db.query("alumni").collect();
  },
});

export const addAlumni = mutation({
  args: {
    name: v.string(),
    degree: v.string(),
    currentPosition: v.string(),
    testimonial: v.string(),
    linkedin: v.optional(v.string()),
    image: v.optional(cloudinaryImage),
    graduatedOn: v.optional(v.string()),
    company: v.string(),
    email: v.optional(v.string()),
    tel: v.string(),
  },
  handler: async (ctx, args) => {
    if (args.image) assertCloudinaryImage(args.image, "alumni");

    await ctx.db.insert("alumni", {
      name: args.name,
      degree: args.degree,
      currentPosition: args.currentPosition,
      testimonial: args.testimonial,
      linkedin: args.linkedin ?? "",
      company: args.company,
      graduatedOn: args.graduatedOn ?? "",
      photo: args.image?.url ?? "",
      photoPublicId: args.image?.publicId,
      email: args.email,
      tel: args.tel,
    });
  },
});

export const updateAlumnus = mutation({
  args: {
    id: v.id("alumni"),
    name: v.string(),
    degree: v.string(),
    currentPosition: v.string(),
    testimonial: v.string(),
    linkedin: v.string(),
    company: v.optional(v.string()),
    graduatedOn: v.optional(v.string()),
    email: v.optional(v.string()),
    tel: v.string(),
    // New Cloudinary photo; omit to keep the current one.
    image: v.optional(cloudinaryImage),
  },
  handler: async (ctx, { id, image, ...fields }) => {
    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("Alumnus not found");

    const patch: Partial<Doc<"alumni">> = { ...fields };
    if (image) {
      assertCloudinaryImage(image, "alumni");
      patch.photo = image.url;
      patch.photoPublicId = image.publicId;
      // Patching a field to undefined removes it from the document.
      patch.storageId = undefined;
    }

    await ctx.db.patch(id, patch);

    if (image) {
      // Delete the old files only after nothing references them.
      await deleteOrphanedPhotos(
        ctx,
        photoFiles(existing).filter((f) => f.publicId !== image.publicId)
      );
    }
  },
});

export const deleteAlumnus = mutation({
  args: { id: v.id("alumni") },
  handler: async (ctx, { id }) => {
    const existing = await ctx.db.get(id);
    if (!existing) return;
    await ctx.db.delete(id);
    await deleteOrphanedPhotos(ctx, photoFiles(existing));
  },
});
