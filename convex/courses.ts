import type { Infer } from "convex/values";
import { v } from "convex/values";
import sanitizeHtml from "sanitize-html";
import { generateSlug } from "../lib/slugUtils";
import { mutation, query } from "./_generated/server";
import { courseType, facultyType } from "./schema";
import { Id } from "./_generated/dataModel";

type Faculty = Infer<typeof facultyType>;
type CourseType = Infer<typeof courseType>;

// Get Courses by Type
export const getCoursesByType = query({
  args: { type: courseType },
  handler: async (ctx, { type }) => {
    return await ctx.db
      .query("courses")
      .withIndex("by_type", (q) => q.eq("type", type))
      .collect();
  },
});

// Get Courses by Faculty
export const getCoursesByFaculty = query({
  args: { faculty: facultyType },
  handler: async (ctx, { faculty }) => {
    const allCourses = await ctx.db
      .query("courses")
      .withIndex("by_faculty", (q) => q.eq("faculty", faculty))
      .collect();

    return allCourses;
  },
});

// Get Program by Slug
export const getProgramBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    return await ctx.db
      .query("courses")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();
  },
});

// Add Course
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
    const courseId = await ctx.db.insert("courses", {
      ...args,
      slug,
      overview: cleanOverview,
    });

    return courseId;
  },
});

// Update Course
export const updateCourse = mutation({
  args: {
    id: v.id("courses"),
    course: v.optional(v.string()),
    overview: v.optional(v.string()),
    whyChoose: v.optional(
      v.array(v.object({ title: v.string(), description: v.string() }))
    ),
    duration: v.optional(v.string()),
    mode: v.optional(v.string()),
    faculty: facultyType,
    type: courseType,
    pdfId: v.optional(v.string()),
    courseMaterials: v.optional(
      v.array(v.object({ title: v.string(), file: v.id("_storage") }))
    ),
  },
  handler: async (ctx, args) => {
    const existingCourse = await ctx.db.get(args.id);
    if (!existingCourse) {
      throw new Error("Course not found");
    }

    // Slug logic: Generate a new slug if course name is updated
    let slug = existingCourse.slug;
    if (args.course && args.course !== existingCourse.course) {
      slug = generateSlug(args.course);
    }

    // await ctx.db.patch(args.id, {
    //   ...(args.course && { course: args.course }),
    //   ...(args.overview && { overview: args.overview }),
    //   ...(args.whyChoose && {
    //     whyChoose: (existingCourse.whyChoose ?? []).concat(args.whyChoose),
    //   }),
    //   ...(args.duration && { duration: args.duration }),
    //   ...(args.mode && { mode: args.mode }),
    //   ...(args.faculty && { faculty: args.faculty }),
    //   ...(args.type && { type: args.type }),
    //   ...(args.courseMaterials && {
    //     courseMaterials: (existingCourse.courseMaterials ?? []).concat(
    //       args.courseMaterials
    //     ),
    //   }),
    //   slug,
    // });

    // Prepare data to update
    const updateData: {
      course?: string;
      overview?: string;
      whyChoose?: { title: string; description: string }[];
      duration?: string;
      mode?: string;
      slug?: string;
      faculty?: Faculty;
      type?: CourseType;
      courseMaterials?: { title: string; file: Id<'_storage'> }[];
    } = {};

    // Add fields to update data if they are provided
    if (args.course !== undefined) updateData.course = args.course;
    if (args.overview !== undefined) updateData.overview = args.overview;
    if (args.whyChoose !== undefined) updateData.whyChoose = args.whyChoose;
    if (args.duration !== undefined) updateData.duration = args.duration;
    if (args.mode !== undefined) updateData.mode = args.mode;
    if (args.faculty !== undefined) updateData.faculty = args.faculty;
    if (args.type !== undefined) updateData.type = args.type;
    if (slug !== existingCourse.slug) updateData.slug = slug;

    if (args.courseMaterials !== undefined) {
      updateData.courseMaterials = args.courseMaterials.map((material) => ({
        title: material.title,
        file: material.file,
      }));
    }

    // Handle course materials (with storageId as URL)
    // if (args.courseMaterials !== undefined) {
    //   // Get existing course materials (if any)
    //   const existingMaterials: { title: string; file: string }[] =
    //     existingCourse.courseMaterials || [];

    //   // Upload and resolve file URLs for new materials
    //   const newMaterials = await Promise.all(
    //     args.courseMaterials.map(async (material) => {
    //       if (!material.file) {
    //         return { title: material.title, file: "" };
    //       }
    //       const storageUrl = await ctx.storage.getUrl(
    //         material.file as Id<"_storage">
    //       );
    //       return {
    //         title: material.title,
    //         file: storageUrl ?? "",
    //       };
    //     })
    //   );

    //   // Merge logic:
    //   const mergedMaterials: { title: string; file: string }[] = [];

    //   for (
    //     let i = 0;
    //     i < Math.max(existingMaterials.length, newMaterials.length);
    //     i++
    //   ) {
    //     const existing = existingMaterials[i];
    //     const updated = newMaterials[i];

    //     if (updated && updated.title) {
    //       // If updated material exists at this index, use it
    //       mergedMaterials.push(updated);
    //     } else if (existing) {
    //       // Else, keep existing material
    //       mergedMaterials.push(existing);
    //     }
    //   }

    //   updateData.courseMaterials = mergedMaterials;

    //   // const courseMaterialsWithUrls = await Promise.all(
    //   //   args.courseMaterials.map(async (material) => {
    //   //     if (!material.file) {
    //   //       return { title: material.title, file: "" };
    //   //     }
    //   //     const url = await ctx.storage.getUrl(material.file);
    //   //     return {
    //   //       title: material.title,
    //   //       file: url ?? "", // fallback empty if no URL
    //   //     };
    //   //   })
    //   // );

    //   // updateData.courseMaterials = courseMaterialsWithUrls;
    // }

    // Perform the update
     await ctx.db.patch(args.id, updateData);
  },
});

// Delete Course
export const deleteCourse = mutation({
  args: { id: v.id("courses") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});

// Generate Upload URL
export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

export const getFileUrl = query({
  args: { fileId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.fileId);
  },
});
