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
import { Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { Minus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { RichTextEditor } from "../RichTextEditor";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

type Faculty =
  | "Faculty of Arts"
  | "Faculty of Education"
  | "Faculty of Mgt. & Social Sciences"
  | "Faculty of Nat. Science & Environmental Studies"
  | "Faculty of Law";

type CourseType = "pgd" | "masters" | "phd";

type CourseProps = {
  c_id: Id<"courses">;
  c_course: string;
  c_duration: string;
  c_mode: string;
  c_overview: string;
  c_whyChoose: { title: string; description: string }[];
  c_faculty: Faculty;
  c_type: CourseType;
};

const durationOptions = ["12 Months", "18 Months", "24 Months"] as const;
const modeOptions = ["On-line", "On-campus", "On-line & On-campus"] as const;
const facultyOptions: Faculty[] = [
  "Faculty of Arts",
  "Faculty of Education",
  "Faculty of Mgt. & Social Sciences",
  "Faculty of Nat. Science & Environmental Studies",
  "Faculty of Law",
];
const courseTypeOptions: CourseType[] = ["pgd", "masters", "phd"];

const UpdateCourse = ({
  c_id,
  c_course,
  c_duration,
  c_mode,
  c_overview,
  c_whyChoose,
  c_faculty,
  c_type,
}: CourseProps) => {
  const updateCourse = useMutation(api.courses.updateCourse);

  const [course, setCourse] = useState(c_course);
  const [duration, setDuration] = useState(c_duration);
  const [mode, setMode] = useState(c_mode);
  const [overview, setOverview] = useState(c_overview);
  const [whyChoose, setWhyChoose] = useState(c_whyChoose);
  const [faculty, setFaculty] = useState<Faculty>(c_faculty);
  const [type, setType] = useState<CourseType>(c_type);
  const [open, setOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (open) {
      setCourse(c_course);
      setDuration(c_duration);
      setMode(c_mode);
      setOverview(c_overview);
      setWhyChoose(c_whyChoose);
      setFaculty(c_faculty);
      setType(c_type);
    }
  }, [
    open,
    c_course,
    c_duration,
    c_mode,
    c_overview,
    c_whyChoose,
    c_faculty,
    c_type,
  ]);

  const handleWhyChooseChange = (
    index: number,
    field: "title" | "description",
    value: string
  ) => {
    const updated = [...whyChoose];
    updated[index] = { ...updated[index], [field]: value };
    setWhyChoose(updated);
  };

  const addWhyChoose = () => {
    setWhyChoose((prev) => [...prev, { title: "", description: "" }]);
  };

  const removeWhyChoose = (index: number) => {
    setWhyChoose((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdate = async () => {
    setUpdating(true);

    if (!faculty || !type || !course || !duration || !mode || !overview) {
      toast.warning("Warning!", { description: "All fields must be filled." });
      setUpdating(false);
      return;
    }

    try {
      await updateCourse({
        id: c_id,
        course,
        duration,
        mode,
        overview,
        whyChoose,
        faculty,
        type,
      });

      toast.success("Done!", { description: "Course updated successfully." });
      setOpen(false);
    } catch (error) {
      toast.error("Error!", { description: `${error}` });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant='outline' className='w-full' disabled={updating}>
          {updating ? (
            <div className='flex items-center gap-2'>
              <Minus className='animate-spin' size={16} /> Updating...
            </div>
          ) : (
            "Update"
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className='max-w-2xl max-h-[calc(100vh-4rem)] flex flex-col'>
        <DialogHeader>
          <DialogTitle>Update Course Details</DialogTitle>
        </DialogHeader>

        <div className='space-y-4 overflow-y-auto flex-1 py-4'>
          <div className='space-y-1'>
            <label className='text-sm text-muted-foreground'>Faculty</label>
            <Select
              value={faculty}
              onValueChange={(value) => setFaculty(value as Faculty)}>
              <SelectTrigger>
                <SelectValue placeholder='Select Faculty' />
              </SelectTrigger>
              <SelectContent>
                {facultyOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-1'>
            <label className='text-sm text-muted-foreground'>Course Type</label>
            <Select
              value={type}
              onValueChange={(value) => setType(value as CourseType)}>
              <SelectTrigger>
                <SelectValue placeholder='Select Course Type' />
              </SelectTrigger>
              <SelectContent>
                {courseTypeOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option.toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-1'>
            <label className='text-sm text-muted-foreground'>Course Name</label>
            <Input
              placeholder='Course name'
              value={course}
              onChange={(e) => setCourse(e.target.value)}
            />
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-1'>
              <label className='text-sm text-muted-foreground'>Duration</label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger>
                  <SelectValue placeholder='Select Duration' />
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
              <label className='text-sm text-muted-foreground'>Mode</label>
              <Select value={mode} onValueChange={setMode}>
                <SelectTrigger>
                  <SelectValue placeholder='Select Mode' />
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
            <label className='text-sm text-muted-foreground'>Overview</label>
            <RichTextEditor value={overview} onChange={setOverview} />
          </div>

          <div className='space-y-4'>
            <label className='text-sm text-muted-foreground'>
              Why Choose This Course
            </label>

            {whyChoose.map((item, index) => (
              <div key={index} className='space-y-2 border p-4 rounded-lg'>
                <Input
                  placeholder='Title'
                  value={item.title}
                  onChange={(e) =>
                    handleWhyChooseChange(index, "title", e.target.value)
                  }
                />
                <Input
                  placeholder='Description'
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
                  Remove
                </Button>
              </div>
            ))}
            <div>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={addWhyChoose}>
                Add Reason
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter className='sm:justify-end gap-2'>
          <DialogClose asChild>
            <Button type='button' variant='secondary' disabled={updating}>
              Cancel
            </Button>
          </DialogClose>
          <Button type='button' disabled={updating} onClick={handleUpdate}>
            {updating ? <Minus className='animate-spin' /> : "Update"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateCourse;
