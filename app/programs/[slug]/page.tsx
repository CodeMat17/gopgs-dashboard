"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "convex/react";
import { Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { z } from "zod";
import {RichTextEditor} from "@/components/RichTextEditor";
import { useForm, useFieldArray } from "react-hook-form";
// import { SafeHTMLRenderer } from "@/components/SafeHTMLRenderer";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
// import { Doc } from "@/convex/_generated/dataModel";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

// Add this type if missing
// type Program = Doc<"programs">;


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
  status: z.boolean(),
});



export default function UpdateProgramPage() {
  const router = useRouter();
  const { slug } = useParams();
  const program = useQuery(
    api.programs.getProgramBySlug,
    typeof slug === "string" ? { slug } : "skip"
  );
  const updateProgram = useMutation(api.programs.updateProgram);
  const [slugPreview, setSlugPreview] = useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      programFullName: "",
      programShortName: "",
      programOverview: "",
      studyDuration: "",
      studyMode: "",
      deliveryMode: "",
      nextIntake: null,
      whyChoose: [{ title: "", description: "" }],
      status: true,
    },
  });

  useEffect(() => {
    if (program) {
      form.reset({
        programFullName: program.programFullName,
        programShortName: program.programShortName,
        programOverview: program.programOverview,
        studyDuration: program.studyDuration,
        studyMode: program.studyMode,
        deliveryMode: program.deliveryMode,
        nextIntake:
          program.nextIntake && program.nextIntake !== "NO-DATE-SET"
            ? new Date(program.nextIntake)
            : null,
        whyChoose: program.whyChoose,
        status: program.status,
      });
      setSlugPreview(program.slug);
    }
  }, [program, form]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "whyChoose",
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!program) return;

    try {
      await updateProgram({
        id: program._id,
        ...values,
        slug: slugPreview,
        nextIntake: values.nextIntake
          ? format(values.nextIntake, "yyyy-MM-dd")
          : "No-DATE-YET",
      });
      toast("Program updated successfully!");
      router.push(`/programs/${slugPreview}`);
    } catch (error) {
      toast("Error updating program");
      console.error("Update error:", error);
    }
  }

  if (!program)
    return (
      <div className='flex items-center justify-center py-72'>
        <p className='text-xl text-gray-500'>Loading program details...</p>
      </div>
    );

  return (
    <div className='max-w-6xl mx-auto p-6'>
      <h1 className='text-3xl font-bold mb-8'>Update Program</h1>
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
                  <Select onValueChange={field.onChange} value={field.value} key={program?.studyDuration}>
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
                  <Select onValueChange={field.onChange} value={field.value} key={program?.studyMode}>
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
                  <Select onValueChange={field.onChange} value={field.value} key={program?.deliveryMode}>
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
                    key={program?._id} // Force re-render when program changes
                    value={field.value}
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
            className='w-full md:w-auto'
            disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? (
              <Loader2 className='h-4 w-4 animate-spin' />
            ) : (
              "Update Program"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
