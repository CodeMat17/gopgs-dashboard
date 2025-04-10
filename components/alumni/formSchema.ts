import { z } from "zod";
// import { Id } from "@/convex/_generated/dataModel";

export const AlumniFormSchema = z.object({
  name: z.string().min(5, "Name must be at least 5 characters"),
  degree: z.string(),
  currentPosition: z.string(),
  testimonial: z.string(),
  linkedin: z.string().url("Invalid LinkedIn URL"),
  company: z.string(),
  graduatedOn: z.string(),
  photo: z.string().optional(),
  tel: z.string(),
  email: z.string().optional(),
  // phone: z.number(),
  storageId: z.string(),
});

export type AlumniFormValues = z.infer<typeof AlumniFormSchema>;
