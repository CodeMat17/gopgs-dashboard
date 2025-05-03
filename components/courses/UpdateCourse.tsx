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
import { Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { Loader2, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { RichTextEditor } from "../RichTextEditor";

const validFaculties = [
  "Faculty of Arts",
  "Faculty of Education",
  "Faculty of Mgt. & Social Sciences",
  "Faculty of Nat. Science & Environmental Studies",
  "Faculty of Law",
] as const;

const validCourseLevels = ["pgd", "masters", "phd"] as const;
const durationOptions = ["1 Year", "2 Years", "3 Years"];
const modeOptions = ["On-line", "On-campus", "On-line & On-campus"];

type Faculty = (typeof validFaculties)[number];
type CourseLevel = (typeof validCourseLevels)[number];
type WhyChooseItem = { title: string; description: string };

type UpdateCourseProps = {
  id: Id<"courses">;
  c_course: string;
  c_faculty: Faculty;
  c_duration: string;
  c_type: CourseLevel;
  c_mode: string;
  c_overview: string;
  c_whyChoose: WhyChooseItem[];
};

const UpdateCourse = ({
  id,
  c_course,
  c_faculty,
  c_duration,
  c_type,
  c_mode,
  c_overview,
  c_whyChoose,
}: UpdateCourseProps) => {
  const [open, setOpen] = useState(false);
  const [faculty, setFaculty] = useState<Faculty>(c_faculty);
  const [type, setType] = useState<CourseLevel>(c_type);
  const [course, setCourse] = useState(c_course);
  const [duration, setDuration] = useState(c_duration);
  const [mode, setMode] = useState(c_mode);
  const [overview, setOverview] = useState(c_overview);
  const [whyChoose, setWhyChoose] = useState<WhyChooseItem[]>(c_whyChoose);
  const [isLoading, setIsLoading] = useState(false);

  const updateCourse = useMutation(api.courses.updateCourse);

  // Sync state with props when they change
  useEffect(() => {
    setFaculty(c_faculty);
    setType(c_type);
    setCourse(c_course);
    setDuration(c_duration);
    setMode(c_mode);
    setOverview(c_overview);
    setWhyChoose(c_whyChoose);
  }, [
    c_course,
    c_duration,
    c_faculty,
    c_mode,
    c_overview,
    c_type,
    c_whyChoose,
  ]);

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
      if (!faculty || !type || !course || !duration || !mode || !overview) {
        throw new Error("All required fields must be filled");
      }

      if (whyChoose.some((item) => !item.title || !item.description)) {
        throw new Error("All Why Choose fields must be filled");
      }

      await updateCourse({
        id,
        faculty,
        type,
        course,
        duration,
        mode,
        overview,
        whyChoose,
      });

      toast.success("Course updated successfully", {
        description: `${course} has been updated`,
      });

      setOpen(false);
    } catch (error) {
      toast.error("Failed to update course", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant='outline' size='sm' className='w-full'>
          Update
        </Button>
      </DialogTrigger>
      <DialogContent className='max-w-2xl max-h-[90vh] flex flex-col'>
        <DialogHeader>
          <DialogTitle>Update Course</DialogTitle>
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
                  <SelectValue placeholder='Select program type'>
                    {type.toUpperCase()}
                  </SelectValue>
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
                placeholder='Enter course title'
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
                    {durationOptions.map((dur) => (
                      <SelectItem key={dur} value={dur} className='py-2'>
                        {dur}
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
                    {modeOptions.map((m, i) => (
                      <SelectItem key={i} value={m} className='py-2'>
                        {m}
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
              <div key={index} className=' group space-y-1 items-center'>
               
                  <Input
                    value={item.title}
                    onChange={(e) =>
                      handleWhyChooseChange(index, "title", e.target.value)
                    }
                    placeholder='Reason title'
                    disabled={isLoading}
                  />

                  <Input
                    value={item.description}
                    onChange={(e) =>
                      handleWhyChooseChange(
                        index,
                        "description",
                        e.target.value
                      )
                    }
                    placeholder='Reason description'
                    disabled={isLoading}
                  />
                   <Button
                  variant='destructive'
               size='sm'
                  onClick={() => removeWhyChooseField(index)}
                  disabled={whyChoose.length === 1 || isLoading}
                  className='opacity-0 group-hover:opacity-100 transition-opacity'>
                 Remove 
                </Button>
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
                Updating...
              </>
            ) : (
              "Update"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateCourse;
