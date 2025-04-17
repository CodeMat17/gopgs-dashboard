"use client";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { RichTextEditor } from "../RichTextEditor";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { generateSlug } from "@/lib/slugUtils";

const durationOptions = ["12 Months", "18 Months", "24 Months"];
const modeOptions = ["On-line", "On-campus", "On-line & On-campus"];

const AddMastersCourse = () => {
  const addCourse = useMutation(api.courses.addCourse);
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [course, setCourse] = useState("");
  const [duration, setDuration] = useState("");
  const [mode, setMode] = useState("");
  const [overview, setOverview] = useState("");
  const [whyChoose, setWhyChoose] = useState<
    { title: string; description: string }[]
  >([]);

  const handleWhyChooseChange = (
    index: number,
    field: "title" | "description",
    value: string
  ) => {
    const updatedWhyChoose = [...whyChoose];
    updatedWhyChoose[index][field] = value;
    setWhyChoose(updatedWhyChoose);
  };

  const addWhyChoose = () => {
    setWhyChoose([...whyChoose, { title: "", description: "" }]);
  };

  const removeWhyChoose = (index: number) => {
    setWhyChoose(whyChoose.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    // Validate all required fields
    if (!course || !duration || !mode || !overview) {
      toast.error("All fields are required");
      return;
    }

    // Validate whyChoose items
    const validWhyChoose = whyChoose.filter(
      (item) => item.title && item.description
    );
    if (validWhyChoose.length === 0) {
      toast.error("Please add at least one 'Why Choose' reason");
      return;
    }

    setIsSubmitting(true);
    try {
      await addCourse({
        course,
        duration,
        mode,
        overview,
        whyChoose: validWhyChoose,
        type: "masters",
        slug: generateSlug(course),
      });

      toast.success("Course added successfully");
      setOpen(false);
      resetForm();
    } catch (error) {
      toast.error("Failed to add course", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setCourse("");
    setDuration("");
    setMode("");
    setOverview("");
    setWhyChoose([]);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant='outline'>
          <span className='sm:hidden'>+</span>{" "}
          <span className='hidden sm:block'>Add</span>Master&apos;s Course
        </Button>
      </DialogTrigger>
      <DialogContent className='max-w-2xl max-h-[calc(100vh-4rem)] flex flex-col'>
        <DialogHeader>
          <DialogTitle>Add New Master&apos;s Course</DialogTitle>
        </DialogHeader>

        <div className='space-y-4 overflow-y-auto flex-1 py-4'>
          <div className='space-y-1'>
            <label className='text-sm font-medium'>Course Name *</label>
            <Input
              placeholder='Enter course name'
              value={course}
              onChange={(e) => setCourse(e.target.value)}
            />
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-1'>
              <label className='text-sm font-medium'>Duration *</label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger>
                  <SelectValue placeholder='Select duration' />
                </SelectTrigger>
                <SelectContent>
                  {durationOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-1'>
              <label className='text-sm font-medium'>Mode *</label>
              <Select value={mode} onValueChange={setMode}>
                <SelectTrigger>
                  <SelectValue placeholder='Select mode' />
                </SelectTrigger>
                <SelectContent>
                  {modeOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className='space-y-1'>
            <label className='text-sm font-medium'>Overview *</label>
            <RichTextEditor value={overview} onChange={setOverview} />
          </div>

          <div className='space-y-4'>
            <div className='flex justify-between items-center'>
              <label className='text-sm font-medium'>
                Why Choose This Course *
              </label>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={addWhyChoose}>
                <Plus className=' h-4 w-4' /> Add Reason
              </Button>
            </div>

            {whyChoose.map((item, index) => (
              <div key={index} className='space-y-2 border p-4 rounded-lg'>
                <Input
                  placeholder='Reason title'
                  value={item.title}
                  onChange={(e) =>
                    handleWhyChooseChange(index, "title", e.target.value)
                  }
                />
                <Input
                  placeholder='Reason description'
                  value={item.description}
                  onChange={(e) =>
                    handleWhyChooseChange(index, "description", e.target.value)
                  }
                />
                <Button
                  variant='destructive'
                  size='sm'
                  className='mt-2'
                  onClick={() => removeWhyChoose(index)}>
                  Remove Reason
                </Button>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter className='sm:justify-end gap-2'>
          <DialogClose asChild>
            <Button type='button' variant='secondary'>
              Cancel
            </Button>
          </DialogClose>
          <Button type='button' onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            ) : null}
            {isSubmitting ? "Adding..." : "Add Course"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddMastersCourse;
