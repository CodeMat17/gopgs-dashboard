import { v } from "convex/values";
import sanitizeHtml from "sanitize-html";
import { mutation, query } from "./_generated/server";

export const getFewProgramsData = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("programs")
      .collect()
      .then((programs) =>
        programs.map(
          ({
            _id,
            programShortName,
            status,
            studyDuration,
            deliveryMode,
            slug,
          }) => ({
            _id,
            programShortName,
            status,
            studyDuration,
            deliveryMode,
            slug,
          })
        )
      );
  },
});

export const getAllProgramsData = query({
  handler: async (ctx) => {
    return await ctx.db.query("programs").collect();
  },
});

export const getProgramBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("programs")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
  },
});

// ✅ Update an existing program
export const updateProgram = mutation({
  args: {
    id: v.id("programs"), // ID of the program to update
    programFullName: v.optional(v.string()),
    programShortName: v.optional(v.string()),
    programOverview: v.optional(v.string()),
    whyChoose: v.optional(
      v.array(
        v.object({
          title: v.string(),
          description: v.string(),
        })
      )
    ),
    nextIntake: v.optional(v.string()),
    studyDuration: v.optional(v.string()),
    deliveryMode: v.optional(v.string()),
    studyMode: v.optional(v.string()),
    slug: v.optional(v.string()),
    status: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
     await ctx.db.patch(args.id, {
       programFullName: args.programFullName,
       programShortName: args.programShortName,
       programOverview: args.programOverview,
       studyDuration: args.studyDuration,
       studyMode: args.studyMode,
       deliveryMode: args.deliveryMode,
       nextIntake: args.nextIntake,
       whyChoose: args.whyChoose,
       slug: args.slug,
       status: args.status,
     });
    
     return args.id;
  },
});

// ✅ Add a new program
export const addProgram = mutation({
  args: {
    programFullName: v.string(),
    programShortName: v.string(),
    programOverview: v.string(),
    whyChoose: v.array(
      v.object({
        title: v.string(),
        description: v.string(),
      })
    ),
    nextIntake: v.string(),
    studyDuration: v.string(),
    deliveryMode: v.string(),
    studyMode: v.string(),
    slug: v.string(),
    status: v.boolean(),
  },
  handler: async (ctx, args) => {
    // Validate required fields
    if (!args.programFullName || args.programFullName.length < 2) {
      throw new Error("Program name must be at least 2 characters");
    }

    if (!args.programShortName || args.programShortName.length < 2) {
      throw new Error("Short name must be at least 2 characters");
    }

    if (!args.slug) {
      throw new Error("Slug is required");
    }

    // Sanitize HTML content
    const cleanOverview = sanitizeHtml(args.programOverview, {
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
      disallowedTagsMode: "discard",
    });

    // Validate intake date format
    const isValidDate =
      args.nextIntake === "No-DATE-YET" ||
      /^\d{4}-\d{2}-\d{2}$/.test(args.nextIntake);

    if (!isValidDate) {
      throw new Error("Invalid date format. Use YYYY-MM-DD or 'No-DATE-YET'");
    }

    try {
      return await ctx.db.insert("programs", {
        ...args,
        programOverview: cleanOverview,
       
        // Convert string date to proper format
        nextIntake:
          args.nextIntake === "No-DATE-YET"
            ? "No-DATE-YET"
            : new Date(args.nextIntake).toISOString(),
      });
    } catch (error) {
      throw new Error(
        `Failed to create program: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  },
});

// ✅ Remove a program
export const removeProgram = mutation({
  args: {
    _id: v.id("programs"), // ID of the program to delete
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args._id);
    return { success: true, message: "Program deleted successfully" };
  },
});
