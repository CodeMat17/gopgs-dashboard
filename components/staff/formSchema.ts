import { z } from "zod";
// import { Id } from "@/convex/_generated/dataModel";

export const StaffFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  role: z.string().min(2, "Role must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  linkedin: z.string().url("Invalid LinkedIn URL"),
  profile: z.string().optional(),
  // New Cloudinary photo picked in the form; absent keeps the current one.
  image: z.object({ url: z.string(), publicId: z.string() }).optional(),
  removeImage: z.boolean().optional(),
});

export type StaffFormValues = z.infer<typeof StaffFormSchema>;
