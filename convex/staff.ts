import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";

export const getStaff = query({
  handler: async (ctx) => {
    const staff = await ctx.db.query("staff").collect();

    const staffWithUrls = await Promise.all(
      staff.map(async (staffMember) => {
        const imageUrl = staffMember.body
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
    await ctx.db.delete(id);
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
    storageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const { id, name, role, email, linkedin, profile, storageId } = args;

    // Fetch existing staff member
    const existingStaff = await ctx.db.get(id);
    if (!existingStaff) throw new Error("Staff member not found");

    let imageUrl: string | null = null;

    // Determine the image URL: Use new storageId if provided, otherwise use the existing one
    const finalStorageId = storageId ?? existingStaff.body;
    if (finalStorageId) {
      imageUrl = await ctx.storage.getUrl(finalStorageId);
    }

    // Prepare the data to be updated
    const updateData: {
      name: string;
      role: string;
      email: string;
      linkedin?: string;
      profile?: string;
      body?: Id<"_storage">;
    } = {
      name,
      role,
      email,
      linkedin,
      profile,

      // body: finalStorageId,
    };

    // Only update `body` (storageId) if a new one is provided
    if (storageId) {
      updateData.body = storageId;
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

export const createStaff = mutation({
  args: {
    storageId: v.id("_storage"),
    name: v.string(),
    role: v.string(),
    email: v.string(),
    linkedin: v.optional(v.string()),
    profile: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("staff", {
      body: args.storageId,
      name: args.name,
      role: args.role,
      email: args.email,
      linkedin: args.linkedin,
      profile: args.profile,
      format: "image",
    });
  },
});

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});
