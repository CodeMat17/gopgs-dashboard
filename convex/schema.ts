import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  hero: defineTable({
    title: v.string(),
    desc: v.array(v.string()),
  }),

  vision: defineTable({
    title: v.string(),
    desc: v.string(),
  }),

  mission: defineTable({
    title: v.string(),
    desc: v.string(),
  }),

  programs: defineTable({
    programFullName: v.optional(v.string()),
    programShortName: v.string(),
    programOverview: v.string(),
    whyChoose: v.array(
      v.object({
        title: v.string(), // e.g., "Cutting-Edge Facilities"
        description: v.string(), // e.g., "Access to state-of-the-art labs and research equipment"
      })
    ),
    nextIntake: v.string(),
    studyDuration: v.string(),
    deliveryMode: v.string(),
    studyMode: v.string(),
    slug: v.string(),
    status: v.boolean(),
  }).index("by_slug", ["slug"]),

  alumni: defineTable({
    name: v.string(),
    photo: v.optional(v.string()),
    degree: v.string(),
    year: v.optional(v.number()),
    currentPosition: v.string(),
    company: v.string(),
    testimonial: v.string(),
    linkedin: v.string(),
    storageId: v.optional(v.string()),
    graduatedOn: v.optional(v.string()),
    phone: v.optional(v.number()),
    email: v.optional(v.string()),
    tel: v.optional(v.string()),
  }),

  staff: defineTable({
    name: v.string(),
    role: v.string(),
    body: v.optional(v.id("_storage")),
    imageStorageId: v.optional(v.id("_storage")),
    bio: v.optional(v.string()),
    email: v.string(),
    profile: v.optional(v.string()),
    linkedin: v.optional(v.string()),
    format: v.optional(v.string()),
    social: v.optional(
      v.object({
        linkedin: v.string(),
        twitter: v.string(),
      })
    ),
    image: v.optional(v.string()),
  }),

  whyChoose: defineTable({
    reasons: v.array(
      v.object({
        title: v.string(),
        description: v.string(),
      })
    ),
  }),

  admissionRequirements: defineTable({
    title: v.string(),
    requirements: v.array(v.string()),
  }),

  alternativeAdmissions: defineTable({
    title: v.string(),
    description: v.string(),
  }),

  contactUs: defineTable({
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
    admissionOffice: v.optional(
      v.array(
        v.object({
          email: v.string(),
          tel: v.string(),
        })
      )
    ),
  }),
});
