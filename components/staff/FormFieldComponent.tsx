"use client";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
// import { useFormContext } from "react-hook-form";
import { ImageUpload } from "./ImageUpload";
import type { StaffFormValues } from "@/components/staff/formSchema";
import { UseFormReturn } from "react-hook-form";
import { Id } from "@/convex/_generated/dataModel";

export function FormFieldComponent({
  form,
}: {
  form: UseFormReturn<StaffFormValues>;
}) {
  return (
    <div className='space-y-4'>
      {/* Image Upload Field */}
      <FormField
        control={form.control}
        name='imageStorageId'
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <ImageUpload
                storageId={field.value as Id<"_storage"> | null}
                onUploadComplete={(newId) => field.onChange(newId)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Name Field */}
      <FormField
        control={form.control}
        name='name'
        render={({ field }) => (
          <FormItem>
            <FormLabel>Full Name</FormLabel>
            <FormControl>
              <Input placeholder='John Doe' {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Role Field */}
      <FormField
        control={form.control}
        name='role'
        render={({ field }) => (
          <FormItem>
            <FormLabel>Role</FormLabel>
            <FormControl>
              <Input placeholder='CEO' {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Email Field */}
      <FormField
        control={form.control}
        name='email'
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input type='email' placeholder='john@company.com' {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Social Links - Grid Layout */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <FormField
          control={form.control}
          name='linkedin'
          render={({ field }) => (
            <FormItem>
              <FormLabel>LinkedIn URL</FormLabel>
              <FormControl>
                <Input
                  placeholder='https://linkedin.com/in/johndoe'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='twitter'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Twitter URL</FormLabel>
              <FormControl>
                <Input placeholder='https://twitter.com/johndoe' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Bio Field */}
      <FormField
        control={form.control}
        name='bio'
        render={({ field }) => (
          <FormItem>
            <FormLabel>Bio</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Describe the staff member's role and experience..."
                className='min-h-[100px]'
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Profile URL Field */}
      <FormField
        control={form.control}
        name='profile'
        render={({ field }) => (
          <FormItem>
            <FormLabel>Profile URL (optional)</FormLabel>
            <FormControl>
              <Input placeholder='https://company.com/team/john' {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
