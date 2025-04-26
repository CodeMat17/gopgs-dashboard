import { v } from "convex/values";
import sanitizeHtml from "sanitize-html";
import { generateSlug } from "../lib/slugUtils";
import { mutation, query } from "./_generated/server";
import { courseType, facultyType } from "./schema";
import type { Infer } from "convex/values";

type Faculty = Infer<typeof facultyType>;
type CourseType = Infer<typeof courseType>



export const getCoursesByType = query({
  args: { type: courseType },
  handler: async (ctx, { type }) => {
    return await ctx.db
      .query("courses")
      .withIndex("by_type", (q) => q.eq("type", type))
      .collect();
  },
});

export const getCoursesByFaculty = query({
  args: {
    faculty: facultyType,
  },
  handler: async (ctx, args) => {
    const all = await ctx.db
      .query("courses")
      .withIndex("by_faculty", (q) => q.eq("faculty", args.faculty))
      .collect();

    return all;
  },
});

export const getProgramBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("courses")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
  },
});

export const addCourse = mutation({
  args: {
    course: v.string(),
    duration: v.string(),
    overview: v.string(),
    mode: v.string(),
    faculty: facultyType,
    whyChoose: v.array(
      v.object({
        title: v.string(),
        description: v.string(),
      })
    ),
    slug: v.string(),
    type: courseType,
  },
  handler: async (ctx, args) => {
    // Sanitize HTML content
    const cleanOverview = sanitizeHtml(args.overview, {
      allowedTags: [
        "p",
        "strong",
        "em",
        "u",
        "h1",
        "h2",
        "h3",
        "ul",
        "ol",
        "li",
        "a",
      ],
      allowedAttributes: {
        a: ["href", "target", "rel"],
      },
    });

    const slug = args.slug;
    const existingCourse = await ctx.db
      .query("courses")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();

    if (existingCourse) {
      throw new Error("Course with this name already exists");
    }

    // Insert new course
    const courseId = await ctx.db.insert("courses", { ...args, slug, overview: cleanOverview });

    return courseId;
  },
});

export const updateCourse = mutation({
  args: {
    id: v.id("courses"), // ID of the program to update
    course: v.optional(v.string()),
    overview: v.optional(v.string()),
    whyChoose: v.optional(
      v.array(
        v.object({
          title: v.string(),
          description: v.string(),
        })
      )
    ),
    duration: v.optional(v.string()),
    mode: v.optional(v.string()),
    faculty: facultyType,
    type: courseType
  },
  handler: async (ctx, args) => {
    // Get existing course data
    const existingCourse = await ctx.db.get(args.id);

    if (!existingCourse) {
      throw new Error("Course not found");
    }

    // Generate new slug only if course name changes
    let slug = existingCourse.slug;
    if (args.course && args.course !== existingCourse.course) {
      slug = generateSlug(args.course);
    }

    // Prepare update data
    const updateData: {
      course?: string;
      overview?: string;
      whyChoose?: { title: string; description: string }[];
      duration?: string;
      mode?: string;
      slug?: string;
      faculty?: Faculty,
      type?: CourseType
    } = {};

    // Only update provided fields
    if (args.course !== undefined) updateData.course = args.course;
    if (args.overview !== undefined) updateData.overview = args.overview;
    if (args.whyChoose !== undefined) updateData.whyChoose = args.whyChoose;
    if (args.duration !== undefined) updateData.duration = args.duration;
    if (args.mode !== undefined) updateData.mode = args.mode;
    if (args.faculty !== undefined) updateData.faculty = args.faculty;
      if (args.type !== undefined) updateData.type = args.type;
    if (slug !== existingCourse.slug) updateData.slug = slug;

    await ctx.db.patch(args.id, updateData);

    return args.id;
  },
});

export const deleteCourse = mutation({
  args: { id: v.id("courses") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
