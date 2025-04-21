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

type CourseProps = {
  c_id: Id<"courses">;
  c_course: string;
  c_duration: string;
  c_mode: string;
  c_overview: string;
  c_whyChoose: { title: string; description: string }[];
  c_faculty: string;
};

const durationOptions = ["12 Months", "18 Months", "24 Months"];
const modeOptions = ["On-line", "On-campus", "On-line & On-campus"];

const UpdateCourse = ({
  c_id,
  c_course,
  c_duration,
  c_mode,
  c_overview,
  c_whyChoose,
  c_faculty,
}: CourseProps) => {
  const updateCourse = useMutation(api.courses.updateCourse);

  const [id, setId] = useState(c_id);
  const [course, setCourse] = useState(c_course);
  const [duration, setDuration] = useState(c_duration);
  const [mode, setMode] = useState(c_mode);
  const [overview, setOverview] = useState(c_overview);
  const [whyChoose, setWhyChoose] = useState(c_whyChoose);
  const [faculty, setFaculty] = useState(c_faculty);
  const [open, setOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (open) {
      setId(c_id);
      setCourse(c_course);
      setDuration(c_duration);
      setMode(c_mode);
      setOverview(c_overview);
      setWhyChoose(c_whyChoose);
      setFaculty(c_faculty);
    }
  }, [
    open,
    c_id,
    c_course,
    c_duration,
    c_mode,
    c_overview,
    c_whyChoose,
    c_faculty,
  ]);

  const handleWhyChooseChange = (
    index: number,
    field: string,
    value: string
  ) => {
    const updatedWhyChoose = [...whyChoose];
    updatedWhyChoose[index] = { ...updatedWhyChoose[index], [field]: value };
    setWhyChoose(updatedWhyChoose);
  };

  const addWhyChoose = () => {
    setWhyChoose([...whyChoose, { title: "", description: "" }]);
  };

  const removeWhyChoose = (index: number) => {
    setWhyChoose(whyChoose.filter((_, i) => i !== index));
  };

  const handleUpdate = async () => {
    setUpdating(true);

    if (faculty === "") {
      toast.warning("Warning!", {
        description: "Faculty field cannot be empty.",
      });
      setUpdating(false);
      return;
    }

    if (course === "") {
      toast.warning("Warning!", {
        description: "Course field cannot be empty.",
      });
      setUpdating(false);
      return;
    }

    if (duration === "") {
      toast.warning("Warning!", {
        description: "Duration field cannot be empty.",
      });
      setUpdating(false);
      return;
    }

    if (mode === "") {
      toast.warning("Warning!", {
        description: "Mode field cannot be empty.",
      });
      setUpdating(false);
      return;
    }

    if (overview === "") {
      toast.warning("Warning!", {
        description: "Overview field cannot be empty.",
      });
      setUpdating(false);
      return;
    }

    try {
      await updateCourse({
        id,
        course,
        duration,
        mode,
        overview,
        whyChoose,
        faculty,
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
        <Button variant='outline' className='w-full'>
          Update
        </Button>
      </DialogTrigger>
      <DialogContent className='max-w-2xl max-h-[calc(100vh-4rem)] flex flex-col'>
        <DialogHeader>
          <DialogTitle>Update Course Details</DialogTitle>
        </DialogHeader>
        <div className='space-y-4 overflow-y-auto flex-1 py-4'>
          <div className='space-y-1'>
            <label className='text-sm text-muted-foreground'>Faculty</label>
            <Input
              placeholder='Faculty'
              value={faculty}
              onChange={(e) => setFaculty(e.target.value)}
            />
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
              <label className='text-sm text-muted-foreground'>Mode</label>
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
            <Button type='button' variant='secondary'>
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
