import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getPgdFees = query({
  handler: async (ctx) => {
    return await ctx.db.query("pgdFees").order("asc").collect();
  },
});

export const getMastersFees = query({
  handler: async (ctx) => {
    return await ctx.db.query("mastersFees").order("asc").collect();
  },
});

export const getPhdGeneralFees = query({
  handler: async (ctx) => {
    return await ctx.db.query("phdGeneralFees").order("asc").collect();
  },
});

export const getPhdNatSciFees = query({
  handler: async (ctx) => {
    return await ctx.db.query("phdNatSciFees").order("asc").collect();
  },
});

export const getPhdEduFees = query({
  handler: async (ctx) => {
    return await ctx.db.query("phdEduFees").order("asc").collect();
  },
});

export const getAdditionalFees = query({
  handler: async (ctx) => {
    return await ctx.db.query("additionalFees").collect();
  },
});

export const updatePgdFee = mutation({
  args: {
    id: v.id("pgdFees"),
    title: v.string(),
    amount: v.string(),
    description: v.optional(v.string()),

    details: v.array(
      v.object({
        bank: v.string(),
        accountNumber: v.string(),
        accountName: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const { id, ...data } = args;

    // First validate the input
    if (!data.title || !data.amount) {
      throw new Error("Title and amount are required");
    }

    if (
      data.details.some(
        (detail) => !detail.bank || !detail.accountNumber || !detail.accountName
      )
    ) {
      throw new Error("All bank details must be complete");
    }

    // Update the document
    await ctx.db.patch(id, data);

    // Return the updated document
    return await ctx.db.get(id);
  },
});

export const updateMastersFee = mutation({
  args: {
    id: v.id("mastersFees"),
    title: v.string(),
    amount: v.string(),
    description: v.optional(v.string()),

    details: v.array(
      v.object({
        bank: v.string(),
        accountNumber: v.string(),
        accountName: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const { id, ...data } = args;

    // First validate the input
    if (!data.title || !data.amount) {
      throw new Error("Title and amount are required");
    }

    if (
      data.details.some(
        (detail) => !detail.bank || !detail.accountNumber || !detail.accountName
      )
    ) {
      throw new Error("All bank details must be complete");
    }

    // Update the document
    await ctx.db.patch(id, data);

    // Return the updated document
    return await ctx.db.get(id);
  },
});

export const updatePhdGeneralFee = mutation({
  args: {
    id: v.id("phdGeneralFees"),
    title: v.string(),
    amount: v.string(),
    description: v.optional(v.string()),

    details: v.array(
      v.object({
        bank: v.string(),
        accountNumber: v.string(),
        accountName: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const { id, ...data } = args;

    // First validate the input
    if (!data.title || !data.amount) {
      throw new Error("Title and amount are required");
    }

    if (
      data.details.some(
        (detail) => !detail.bank || !detail.accountNumber || !detail.accountName
      )
    ) {
      throw new Error("All bank details must be complete");
    }

    // Update the document
    await ctx.db.patch(id, data);

    // Return the updated document
    return await ctx.db.get(id);
  },
});

export const updatePhdNatSciFee = mutation({
  args: {
    id: v.id("phdNatSciFees"),
    title: v.string(),
    amount: v.string(),
    description: v.optional(v.string()),

    details: v.array(
      v.object({
        bank: v.string(),
        accountNumber: v.string(),
        accountName: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const { id, ...data } = args;

    // First validate the input
    if (!data.title || !data.amount) {
      throw new Error("Title and amount are required");
    }

    if (
      data.details.some(
        (detail) => !detail.bank || !detail.accountNumber || !detail.accountName
      )
    ) {
      throw new Error("All bank details must be complete");
    }

    // Update the document
    await ctx.db.patch(id, data);

    // Return the updated document
    return await ctx.db.get(id);
  },
});

export const updatePhdEduFee = mutation({
  args: {
    id: v.id("phdEduFees"),
    title: v.string(),
    amount: v.string(),
    description: v.optional(v.string()),

    details: v.array(
      v.object({
        bank: v.string(),
        accountNumber: v.string(),
        accountName: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const { id, ...data } = args;

    // First validate the input
    if (!data.title || !data.amount) {
      throw new Error("Title and amount are required");
    }

    if (
      data.details.some(
        (detail) => !detail.bank || !detail.accountNumber || !detail.accountName
      )
    ) {
      throw new Error("All bank details must be complete");
    }

    // Update the document
    await ctx.db.patch(id, data);

    // Return the updated document
    return await ctx.db.get(id);
  },
});

export const addAdditionalFee = mutation({
  args: {
    title: v.string(),
    amount: v.string(),
    description: v.optional(v.string()),
    bank: v.string(),
    accountNumber: v.string(),
    accountName: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("additionalFees", args);
  },
});

export const updateAdditionalFee = mutation({
  args: {
    id: v.id("additionalFees"),
    title: v.optional(v.string()),
    amount: v.optional(v.string()),
    description: v.optional(v.string()),
    bank: v.optional(v.string()),
    accountNumber: v.optional(v.string()),
    accountName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...rest } = args;
    await ctx.db.patch(id, rest);
  },
});

export const getExtraFeesAccount = query({
  handler: async (ctx) => {
    return await ctx.db.query("extraFeesAccount").first();
  },
});

export const getExtraFees = query({
  handler: async (ctx) => {
    return await ctx.db.query("extraFees").order("asc").collect();
  },
});

export const updateExtraFeesAccount = mutation({
  args: {
    id: v.id("extraFeesAccount"),
    bankName: v.string(),
    accountNumber: v.string(),
    accountName: v.string(),
  },
  handler: async (ctx, args) => {
    const { id, bankName, accountNumber, accountName } = args;

    await ctx.db.patch(id, {
      bankName,
      accountNumber,
      accountName,
    });

    return { success: true };
  },
});

export const updateExtraFees = mutation({
  args: {
    id: v.id("extraFees"),
    feeType: v.union(
      v.literal("Course Deferment"),
      v.literal("Development Levy"),
      v.literal("Exams Levy"),
      v.literal("Change of Supervisor"),
      v.literal("Change of Department"),
      v.literal("Utility Levy"),
      v.literal("Carryover Fee")
    ),
    amount: v.string(),
  },
  handler: async (ctx, args) => {
    const { id, ...data } = args;

    await ctx.db.patch(id, data);

    return { success: true };
  },
});