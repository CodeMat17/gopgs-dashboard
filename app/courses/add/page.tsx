"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import {RichTextEditor} from "@/components/RichTextEditor";
import { toast } from "sonner";
import DOMPurify from "dompurify";


const formSchema = z.object({
  programFullName: z
    .string()
    .min(2, "Program name must be at least 2 characters."),
  programShortName: z
    .string()
    .min(2, "Short name must be at least 2 characters."),
  programOverview: z.string().min(10, "Please provide a detailed overview."),
  studyDuration: z.string(),
  studyMode: z.string(),
  deliveryMode: z.string(),
  nextIntake: z.date().nullable(),
  whyChoose: z.array(
    z.object({
      title: z.string().min(2),
      description: z.string().min(10),
    })
  ),
});

export default function AddNewProgram() {
  const addProgram = useMutation(api.programs.addProgram);
  const [slugPreview, setSlugPreview] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      programFullName: "",
      programShortName: "",
      programOverview: "",
      studyDuration: "6 Months",
      studyMode: "Full-time",
      deliveryMode: "On-Campus",
      nextIntake: null,
      whyChoose: [{ title: "", description: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "whyChoose",
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
     setIsLoading(true);
    try {
      await addProgram({
        ...values,
        slug: slugPreview,
        status: true,
        nextIntake: values.nextIntake
          ? format(values.nextIntake, "yyyy-MM-dd")
          : "NO-DATE-SET",
        programOverview: DOMPurify.sanitize(values.programOverview, {
          ALLOWED_TAGS: [
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
          ALLOWED_ATTR: ["href", "target", "rel"],
        }),
      });
      toast( "Program added successfully!" );
      form.reset();
    } catch (error) {
      toast.error("Error adding program",
    
      );
      console.error("Error adding program:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className='max-w-5xl mx-auto p-6'>
      <h1 className='text-3xl font-bold mb-8'>Add New Program</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {/* Program Full Name */}
            <FormField
              control={form.control}
              name='programFullName'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='mb-1'>Program Full Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Program Short Name */}
            <FormField
              control={form.control}
              name='programShortName'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='mb-1'>Program Short Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        setSlugPreview(
                          e.target.value.toLowerCase().replace(/\s+/g, "-")
                        );
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                  {slugPreview && (
                    <div className='text-sm text-muted-foreground mt-1'>
                      Slug Preview: {slugPreview}
                    </div>
                  )}
                </FormItem>
              )}
            />

            {/* Study Duration */}
            <FormField
              control={form.control}
              name='studyDuration'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='mb-1'>Study Duration</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {[...Array(6)].map((_, i) => {
                        const months = (i + 1) * 6;
                        return (
                          <SelectItem key={months} value={`${months} Months`}>
                            {months} Months
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Study Mode */}
            <FormField
              control={form.control}
              name='studyMode'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='mb-1'>Study Mode</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {["Full-time", "Part-time", "Full-time & Part-time"].map(
                        (mode) => (
                          <SelectItem key={mode} value={mode}>
                            {mode}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Delivery Mode */}
            <FormField
              control={form.control}
              name='deliveryMode'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='mb-1'>Delivery Mode</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {["Online", "On-Campus", "Online & On-Campus"].map(
                        (mode) => (
                          <SelectItem key={mode} value={mode}>
                            {mode}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Next Intake */}
            <FormField
              control={form.control}
              name='nextIntake'
              render={({ field }) => (
                <FormItem className='flex flex-col'>
                  <FormLabel className='mb-1'>Next Intake</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button variant='outline'>
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date or select no date</span>
                          )}
                          <CalendarIcon className='ml-2 h-4 w-4 opacity-50' />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className='w-auto p-0' align='start'>
                      <Calendar
                        mode='single'
                        selected={field.value || undefined}
                        onSelect={field.onChange}
                        initialFocus
                      />
                      <div className='p-2'>
                        <Button
                          type='button'
                          variant='outline'
                          size='sm'
                          className='w-full'
                          onClick={() => field.onChange(null)}>
                          No Date Set
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Program Overview */}
          <FormField
            control={form.control}
            name='programOverview'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='mb-1'>Program Overview</FormLabel>
                <FormControl>
                  <RichTextEditor
                    value={field.value || ""}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Why Choose Section */}
          <div className='space-y-4'>
            <FormLabel>Why Choose This Program</FormLabel>
            {fields.map((field, index) => (
              <Card key={field.id} className='p-4 space-y-4'>
                <FormField
                  control={form.control}
                  name={`whyChoose.${index}.title`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='mb-1'>Title</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`whyChoose.${index}.description`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='mb-1'>Description</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {index > 0 && (
                  <Button
                    type='button'
                    variant='destructive'
                    onClick={() => remove(index)}>
                    Remove
                  </Button>
                )}
              </Card>
            ))}
            <Button
              type='button'
              variant='outline'
              onClick={() => append({ title: "", description: "" })}>
              Add Another Reason
            </Button>
          </div>

          <Button
            type='submit'
            disabled={isLoading}
            className='w-full md:w-auto'>
            {isLoading ? (
              <div className='flex items-center gap-2'>
                <Loader2 className='h-4 w-4 animate-spin' />
                Adding...
              </div>
            ) : (
              "Add New Program"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
