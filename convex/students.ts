import { query } from "./_generated/server";
import { v } from "convex/values";

export const getStudentByRegno = query({
  args: { regno: v.string() },
  handler: async ({ db }, { regno }) => {
    return await db
      .query("students")
      .withIndex("by_regno", (q) => q.eq("regno", regno))
      .first();
  },
});
