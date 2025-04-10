import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
// import { Id } from "./_generated/dataModel";

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
    storageId: v.optional(v.string()),
    graduatedOn: v.optional(v.string()),
    company: v.string(),
    email: v.optional(v.string()),
    tel: v.string(),
  },
  handler: async (ctx, args) => {
    let photoUrl = "";

    if (args.storageId) {
      photoUrl =
        (await ctx.storage.getUrl(args.storageId as Id<"_storage">)) ?? "";
    }

    await ctx.db.insert("alumni", {
      name: args.name,
      degree: args.degree,
      currentPosition: args.currentPosition,
      testimonial: args.testimonial,
      linkedin: args.linkedin ?? "",
      company: args.company,
      graduatedOn: args.graduatedOn ?? "",
      photo: photoUrl,
      // phone: args.phone,
      email: args.email,
      tel: args.tel,
      storageId: args.storageId,
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
    photo: v.optional(v.string()),
    email: v.optional(v.string()),
    tel: v.string(),
    storageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const {
      id,
      name,
      degree,
      currentPosition,
      testimonial,
      linkedin,
      company,
      graduatedOn,
      photo,
      storageId,
      tel,
      email,
    } = args;

    // Fetch existing staff member
    const existingStaff = await ctx.db.get(id);
    if (!existingStaff) throw new Error("Staff member not found");

    let imageUrl: string | null = null;

    // Determine the image URL: Use new storageId if provided, otherwise use the existing one
    const finalStorageId = storageId ?? existingStaff.storageId;
    if (finalStorageId) {
      imageUrl = await ctx.storage.getUrl(finalStorageId as Id<'_storage'>);
    }

    // Prepare the data to be updated
    const updateData: {
      name: string;
      degree: string;
      currentPosition: string;
      testimonial: string;
      linkedin?: string;
      company?: string;
      graduatedOn?: string;
      photo?: string;
      email?: string;
      tel: string;
      storageId?: Id<"_storage">;
    } = {
      name,
      degree,
      currentPosition,
      testimonial,
      linkedin,
      company,
      graduatedOn,
      photo,
      tel,
      email,
      storageId,
    };

    // Only update storageId if a new one is provided
    if (storageId) {
      updateData.storageId = storageId;
      const newPhoto = await ctx.storage.getUrl(storageId)
      updateData.photo = newPhoto ?? undefined
    }

    // Update the staff record in the database
    await ctx.db.patch(id, updateData);

    // Return the updated staff record
    return {
      ...existingStaff,
      ...updateData,
      imageUrl,
    };
  },
});

export const deleteAlumnus = mutation({
  args: { id: v.id("alumni") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
