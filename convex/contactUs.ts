import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getContactInfo = query({
  handler: async (ctx) => {
    return await ctx.db.query("contactUs").first();
  },
});

export const updateContactInfo = mutation({
  args: {
    address: v.string(),
    email: v.optional(
      v.array(
        v.object({
          email1: v.string(),
          email2: v.string(),
        })
      )
    ),
    phone: v.optional(
      v.array(
        v.object({
          tel1: v.string(),
          tel2: v.string(),
        })
      )
    ),
    officeHours: v.optional(
      v.array(
        v.object({
          days: v.string(),
          time: v.string(),
        })
      )
    ),
    admissionOffice: v.optional(
      v.array(
        v.object({
          email: v.string(),
          tel: v.string(),
        })
      )
    ),
    researchOffice: v.optional(
      v.array(
        v.object({
          email: v.string(),
          tel: v.string(),
        })
      )
    ),
    studentSupport: v.optional(
      v.array(
        v.object({
          email: v.string(),
          tel: v.string(),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("contactUs").first();
    if (existing) {
      return await ctx.db.patch(existing._id, args);
    }
    return await ctx.db.insert("contactUs", args);
  },
});