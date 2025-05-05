import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { courseType, facultyType } from "./schema";

const faculties = [
  "Faculty of Arts",
  "Faculty of Education",
  "Faculty of Mgt. & Social Sciences",
  "Faculty of Nat. Science & Environmental Studies",
  "Faculty of Law",
] as const;

const programTypes = ["pgd", "masters", "phd"] as const;

export const getStudentByRegno = query({
  args: { regno: v.string() },
  handler: async ({ db }, { regno }) => {
    return await db
      .query("students")
      .withIndex("by_regno", (q) => q.eq("regno", regno))
      .first();
  },
});

export const addStudent = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    phone: v.string(),
    regno: v.string(),
    faculty: facultyType,
    type: courseType,
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("students", args);
  },
});

export const deleteStudent = mutation({
  args: { id: v.id("students") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});

export const updateStudent = mutation({
  args: {
    id: v.id("students"),
    name: v.string(),
    email: v.string(),
    phone: v.string(),
    regno: v.string(),
    faculty: facultyType,
    type: courseType,
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      name: args.name,
      email: args.email,
      phone: args.phone,
      regno: args.regno,
      faculty: args.faculty,
      type: args.type,
    });
  },
});


export const getStudents = query({
  args: {
    filters: v.union(
      v.literal("skip"),
      v.object({
        faculty: v.union(...faculties.map(f => v.literal(f))),
        type: v.union(...programTypes.map(t => v.literal(t)))
      })
    )
  },
  handler: async (ctx, { filters }) => {
    if (filters === "skip") {
      return ctx.db.query("students")
        .order("desc")
        .collect();
    }

    return ctx.db.query("students")
      .withIndex("by_faculty_type", q =>
        q.eq("faculty", filters.faculty)
         .eq("type", filters.type)
      )
      .order("desc")
      .collect();
  }
});