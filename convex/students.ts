import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { courseType, facultyType } from "./schema";


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

// convex/students.ts
export const getStudents = query({
  args: {
    faculty: v.optional(facultyType),
    type: v.optional(courseType),
  },
  handler: async (ctx, args) => {
    const { faculty, type } = args;

    let results;

    if (faculty !== undefined && type !== undefined) {
      results = await ctx.db
        .query("students")
        .withIndex("by_faculty_type", (q) =>
          q.eq("faculty", faculty).eq("type", type)
        )
        .collect();
    } else if (faculty !== undefined) {
      results = await ctx.db
        .query("students")
        .withIndex("by_faculty", (q) => q.eq("faculty", faculty))
        .collect();
    } else if (type !== undefined) {
      results = await ctx.db
        .query("students")
        .withIndex("by_type", (q) => q.eq("type", type))
        .collect();
    } else {
      results = await ctx.db.query("students").collect();
    }

    return results.sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
    );
  },
});


// convex/students.ts
export const getStatistics = query({
  handler: async (ctx) => {
    // Get total count
    const total = (await ctx.db.query("students").collect()).length;

    // Get counts by type using indexes
    const [pgd, masters, phd] = await Promise.all([
      ctx.db.query("students")
        .withIndex("by_type", q => q.eq("type", "pgd"))
        .collect()
        .then(res => res.length),
      ctx.db.query("students")
        .withIndex("by_type", q => q.eq("type", "masters"))
        .collect()
        .then(res => res.length),
      ctx.db.query("students")
        .withIndex("by_type", q => q.eq("type", "phd"))
        .collect()
        .then(res => res.length),
    ]);

    return { 
      total,
      pgd,
      masters, 
      phd
    };
  },
});
