import { z } from "zod";
// import { Id } from "@/convex/_generated/dataModel";

export const AlumniFormSchema = z.object({
  name: z.string().min(5, "Name must be at least 5 characters"),
  degree: z.string(),
  currentPosition: z.string(),
  testimonial: z.string(),
  linkedin: z.string().url("Invalid LinkedIn URL").optional().or(z.literal("")),
  company: z.string(),
  graduatedOn: z.string(),
  tel: z.string(),
  email: z.string().optional(),
  // phone: z.number(),
  // New Cloudinary photo picked in the form; absent keeps the current one.
  image: z.object({ url: z.string(), publicId: z.string() }).optional(),
});

export type AlumniFormValues = z.infer<typeof AlumniFormSchema>;
