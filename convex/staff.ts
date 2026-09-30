import { v } from "convex/values";
import { Doc } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import {
  assertCloudinaryImage,
  cloudinaryImage,
  deleteOrphanedPhotos,
} from "./cloudinary";

/** Every file that holds a staff member's photo, Cloudinary or legacy Convex. */
const photoFiles = (staff: Doc<"staff">) => [
  { publicId: staff.imagePublicId },
  { storageId: staff.body },
  { storageId: staff.imageStorageId },
];

export const getStaff = query({
  handler: async (ctx) => {
    const staff = await ctx.db.query("staff").collect();

    const staffWithUrls = await Promise.all(
      staff.map(async (staffMember) => {
        // Cloudinary photo first; Convex storage only for records not yet migrated.
        const imageUrl =
          staffMember.imagePublicId && staffMember.image
            ? staffMember.image
            : staffMember.body
              ? await ctx.storage.getUrl(staffMember.body)
              : null;

        return {
          ...staffMember,
          imageUrl,
        };
      })
    );
    return staffWithUrls;
  },
});

export const deleteStaff = mutation({
  args: { id: v.id("staff") },
  handler: async (ctx, { id }) => {
    const existing = await ctx.db.get(id);
    if (!existing) return;
    await ctx.db.delete(id);
    await deleteOrphanedPhotos(ctx, photoFiles(existing));
  },
});

export const updateStaff = mutation({
  args: {
    id: v.id("staff"),
    name: v.string(),
    role: v.string(),
    email: v.string(),
    linkedin: v.optional(v.string()),
    profile: v.optional(v.string()),
    // New Cloudinary photo; omit to keep the current one.
    image: v.optional(cloudinaryImage),
    // Clear the photo entirely (ignored when a new image is given).
    removeImage: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, name, role, email, linkedin, profile, image, removeImage } =
      args;

    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("Staff member not found");

    const patch: Partial<Doc<"staff">> = {
      name,
      role,
      email,
      linkedin,
      profile,
    };

    const replacePhoto = !!image || !!removeImage;
    if (replacePhoto) {
      if (image) assertCloudinaryImage(image, "staff");
      // Patching a field to undefined removes it from the document.
      patch.image = image?.url;
      patch.imagePublicId = image?.publicId;
      patch.body = undefined;
      patch.imageStorageId = undefined;
    }

    await ctx.db.patch(id, patch);

    if (replacePhoto) {
      // Delete the old files only after nothing references them.
      await deleteOrphanedPhotos(
        ctx,
        photoFiles(existing).filter((f) => f.publicId !== image?.publicId)
      );
    }
  },
});

export const createStaff = mutation({
  args: {
    image: cloudinaryImage,
    name: v.string(),
    role: v.string(),
    email: v.string(),
    linkedin: v.optional(v.string()),
    profile: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    assertCloudinaryImage(args.image, "staff");
    await ctx.db.insert("staff", {
      image: args.image.url,
      imagePublicId: args.image.publicId,
      name: args.name,
      role: args.role,
      email: args.email,
      linkedin: args.linkedin,
      profile: args.profile,
      format: "image",
    });
  },
});
