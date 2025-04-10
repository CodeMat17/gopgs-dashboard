import { z } from "zod";
// import { Id } from "@/convex/_generated/dataModel";

export const StaffFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  role: z.string().min(2, "Role must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  linkedin: z.string().url("Invalid LinkedIn URL"),
  profile: z.string().optional(),
  storageId: z.string().optional(),
  body: z.string().optional()
});

export type StaffFormValues = z.infer<typeof StaffFormSchema>;
