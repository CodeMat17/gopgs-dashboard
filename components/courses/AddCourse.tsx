"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { Loader2, Plus, Trash } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { RichTextEditor } from "../RichTextEditor";
import { generateSlug } from "@/lib/slugUtils";

const validFaculties = [
  "Faculty of Arts",
  "Faculty of Education",
  "Faculty of Mgt. & Social Sciences",
  "Faculty of Nat. Science & Environmental Studies",
  "Faculty of Law",
] as const;

const validCourseLevels = ["pgd", "masters", "phd"] as const;
const durationOptions = ["12 Months", "18 Months", "24 Months", "30 Months", "36 Months"];
const modeOptions = ["On-line", "On-Campus", "On-line & On-campus"];

type Faculty = (typeof validFaculties)[number];
type CourseLevel = (typeof validCourseLevels)[number];
type WhyChooseItem = { title: string; description: string };

export default function AddCourseModal() {
  const [open, setOpen] = useState(false);
  const [faculty, setFaculty] = useState<Faculty>();
  const [type, setType] = useState<CourseLevel>();
  const [course, setCourse] = useState("");
  const [duration, setDuration] = useState("");
  const [mode, setMode] = useState("");
  const [overview, setOverview] = useState("");
  const [whyChoose, setWhyChoose] = useState<WhyChooseItem[]>([
    { title: "", description: "" },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const addCourse = useMutation(api.courses.addCourse);

  const handleWhyChooseChange = (
    index: number,
    field: keyof WhyChooseItem,
    value: string
  ) => {
    const updatedWhyChoose = [...whyChoose];
    updatedWhyChoose[index][field] = value;
    setWhyChoose(updatedWhyChoose);
  };

  const addWhyChooseField = () => {
    setWhyChoose([...whyChoose, { title: "", description: "" }]);
  };

  const removeWhyChooseField = (index: number) => {
    if (whyChoose.length === 1) return;
    const updatedWhyChoose = whyChoose.filter((_, i) => i !== index);
    setWhyChoose(updatedWhyChoose);
  };

  const handleSubmit = async () => {
    setIsLoading(true);

    try {
      // Frontend validation
      if (!faculty || !type || !course || !duration || !mode || !overview) {
        throw new Error("All required fields must be filled");
      }

      if (whyChoose.some((item) => !item.title || !item.description)) {
        throw new Error("All Why Choose fields must be filled");
      }

      const slug = generateSlug(course);

      await addCourse({
        faculty,
        type,
        course,
        duration,
        mode,
        overview,
        whyChoose,
        slug,
      });

      toast.success("Course added successfully", {
        description: `${course} has been created`,
      });

      // Reset form
      setFaculty(undefined);
      setType(undefined);
      setCourse("");
      setDuration("");
      setMode("");
      setOverview("");
      setWhyChoose([{ title: "", description: "" }]);
      setOpen(false);
    } catch (error) {
      toast.error("Failed to add course", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className='gap-2'>
          <Plus size={16} />
          Add New Course
        </Button>
      </DialogTrigger>
      <DialogContent className='max-w-2xl max-h-[90vh] flex flex-col'>
        <DialogHeader>
          <DialogTitle>Create New Course</DialogTitle>
        </DialogHeader>

        <div className='flex-1 overflow-y-auto space-y-6 py-4'>
          {/* Faculty & Program Selection */}
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <label className='block font-medium'>Faculty</label>
              <Select
                value={faculty}
                onValueChange={(value) => setFaculty(value as Faculty)}
                disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue placeholder='Select faculty' />
                </SelectTrigger>
                <SelectContent className='bg-gray-200 dark:bg-gray-700'>
                  {validFaculties.map((f) => (
                    <SelectItem key={f} value={f} className='py-2'>
                      {f}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <label className='block font-medium'>Program Type</label>
              <Select
                value={type}
                onValueChange={(value) => setType(value as CourseLevel)}
                disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue placeholder='Select program type' />
                </SelectTrigger>
                <SelectContent className='bg-gray-200 dark:bg-gray-700'>
                  {validCourseLevels.map((level) => (
                    <SelectItem key={level} value={level} className='py-2'>
                      {level.toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Course Details */}
          <div className='space-y-4'>
            <div className='space-y-2'>
              <label className='block font-medium'>Course Title</label>
              <Input
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                placeholder='Enter course tile'
                disabled={isLoading}
              />
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <label className='block font-medium'>Duration</label>
                <Select
                  value={duration}
                  onValueChange={setDuration}
                  disabled={isLoading}>
                  <SelectTrigger>
                    <SelectValue placeholder='Select duration' />
                  </SelectTrigger>
                  <SelectContent className='bg-gray-200 dark:bg-gray-700'>
                    {durationOptions.map((duration) => (
                      <SelectItem
                        key={duration}
                        value={duration}
                        className='py-2'>
                        {duration}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <label className='block font-medium'>Program Mode</label>
                <Select
                  value={mode}
                  onValueChange={setMode}
                  disabled={isLoading}>
                  <SelectTrigger>
                    <SelectValue placeholder='Select mode' />
                  </SelectTrigger>
                  <SelectContent className='bg-gray-200 dark:bg-gray-700'>
                    {modeOptions.map((mode) => (
                      <SelectItem key={mode} value={mode} className="py-2">
                        {mode}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Course Overview */}
          <div className='space-y-2'>
            <label className='block font-medium'>Course Overview</label>
            <RichTextEditor value={overview} onChange={setOverview} />
          </div>

          {/* Why Choose This Course */}
          <div className='space-y-4'>
            <div className='flex justify-between items-center'>
              <label className='block font-medium'>
                Why Choose This Course
              </label>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={addWhyChooseField}
                disabled={isLoading}>
                <Plus size={14} className='mr-2' />
                Add Reason
              </Button>
            </div>

            {whyChoose.map((item, index) => (
              <div key={index} className='space-y-2 group'>
                <div className='flex gap-2 items-center'>
                  <Input
                    value={item.title}
                    onChange={(e) =>
                      handleWhyChooseChange(index, "title", e.target.value)
                    }
                    placeholder='Reason title'
                    disabled={isLoading}
                  />
                  <Button
                    variant='ghost'
                    size='icon'
                    onClick={() => removeWhyChooseField(index)}
                    disabled={whyChoose.length === 1 || isLoading}
                    className='opacity-0 group-hover:opacity-100 transition-opacity'>
                    <Trash size={16} className='text-destructive' />
                  </Button>
                </div>
                <Input
                  value={item.description}
                  onChange={(e) =>
                    handleWhyChooseChange(index, "description", e.target.value)
                  }
                  placeholder='Reason description'
                  disabled={isLoading}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Dialog Footer */}
        <DialogFooter className='border-t pt-4'>
          <DialogClose asChild>
            <Button variant='secondary' disabled={isLoading}>
              Cancel
            </Button>
          </DialogClose>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Creating Course...
              </>
            ) : (
              "Create Course"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
