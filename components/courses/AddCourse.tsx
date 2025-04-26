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
import { Label } from "@/components/ui/label";
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
import sanitizeHtml from "sanitize-html";
import { toast } from "sonner";
import { RichTextEditor } from "../RichTextEditor";

type Faculty =
  | "Faculty of Arts"
  | "Faculty of Education"
  | "Faculty of Mgt. & Social Sciences"
  | "Faculty of Nat. Science & Environmental Studies"
  | "Faculty of Law";

type CourseType = "pgd" | "masters" | "phd";

const facultyOptions: Faculty[] = [
  "Faculty of Arts",
  "Faculty of Education",
  "Faculty of Mgt. & Social Sciences",
  "Faculty of Nat. Science & Environmental Studies",
  "Faculty of Law",
];

const modeOptions = ["On-line", "On-campus", "On-line & On-campus"];
const typeOptions: CourseType[] = ["pgd", "masters", "phd"];
const durationOptions = ["12 Months", "18 Months", "24 Months"];

export default function AddCourseModal() {
  const [open, setOpen] = useState(false);
  const [course, setCourse] = useState("");
  const [duration, setDuration] = useState("");
  const [overview, setOverview] = useState("");
  const [mode, setMode] = useState("");
  const [faculty, setFaculty] = useState<Faculty | "">("");
  const [type, setType] = useState<CourseType | "">("");
  const [whyChoose, setWhyChoose] = useState<
    { title: string; description: string }[]
  >([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addCourse = useMutation(api.courses.addCourse);

  const handleWhyChooseChange = (
    index: number,
    field: "title" | "description",
    value: string
  ) => {
    const updated = [...whyChoose];
    updated[index][field] = value;
    setWhyChoose(updated);
  };

  const addWhyChoose = () => {
    setWhyChoose([...whyChoose, { title: "", description: "" }]);
  };

  const removeWhyChoose = (index: number) => {
    setWhyChoose(whyChoose.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    const cleanOverview = sanitizeHtml(overview, {
      allowedTags: [
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
      allowedAttributes: { a: ["href", "target", "rel"] },
    });

    

    if (!course) {
      toast.warning("Error!", {
        description: "Course name field cannot be empty",
      });
      return;
    }

     if (!faculty) {
       toast.warning("Error!", {
         description: "Faculty field cannot be empty",
       });
       return;
     }

     if (!type) {
       toast.warning("Error!", {
         description: "Course type field cannot be empty",
       });
       return;
     }

    if (!duration) {
      toast.warning("Error!", {
        description: "Duration field cannot be empty",
      });
      return;
    }

    if (!mode) {
      toast.warning("Error!", {
        description: "Mode field cannot be empty",
      });
      return;
    }

   

    if (!overview) {
      toast.warning("Error!", {
        description: "Overview field cannot be empty",
      });
      return;
    }

    const validWhyChoose = whyChoose.filter(
      (item) => item.title && item.description
    );
    if (validWhyChoose.length === 0) {
      toast.error("Please add at least one 'Why Choose' reason");
      return;
    }

    if (!whyChoose) {
      toast.warning("Error!", {
        description: "WhyChoose field cannot be empty",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await addCourse({
        course,
        duration,
        overview: cleanOverview,
        mode,
        faculty: faculty as Faculty,
        type: type as CourseType,
        slug: course.toLowerCase().replace(/\s+/g, "-"),
        whyChoose: validWhyChoose,
      });

      toast.success("Course added successfully");
      setOpen(false);
      setCourse("");
      setDuration("");
      setOverview("");
      setMode("");
      setFaculty("");
      setType("");
      setWhyChoose([]);
    } catch (error) {
      console.error("Failed to add course:", error);
      toast.error("Failed to add course", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add New Course</Button>
      </DialogTrigger>
      <DialogContent className='max-w-2xl max-h-[calc(100vh-4rem)] flex flex-col'>
        <DialogHeader>
          <DialogTitle>Add a New Course</DialogTitle>
        </DialogHeader>

        <div className='space-y-4 overflow-y-auto flex-1 py-4'>
          <div>
            <Label>Course Name</Label>
            <Input value={course} onChange={(e) => setCourse(e.target.value)} />
          </div>

          <div>
            <Label>Faculty</Label>
            <Select
              value={faculty}
              onValueChange={(val) => setFaculty(val as Faculty)}>
              <SelectTrigger>
                <SelectValue placeholder='Select faculty' />
              </SelectTrigger>
              <SelectContent>
                {facultyOptions.map((f) => (
                  <SelectItem key={f} value={f}>
                    {f}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Course Type</Label>
            <Select
              value={type}
              onValueChange={(val) => setType(val as CourseType)}>
              <SelectTrigger>
                <SelectValue placeholder='Select program type' />
              </SelectTrigger>
              <SelectContent>
                {typeOptions.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t.toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div>
              <Label>Duration *</Label>
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

            <div>
              <Label>Mode *</Label>
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

          <div>
            <Label>Overview</Label>
            <RichTextEditor value={overview} onChange={setOverview} />
          </div>

          <div className='space-y-4'>
            <div className='flex justify-between items-center'>
              <Label>Why Choose This Course *</Label>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={addWhyChoose}>
                <Plus className='h-4 w-4 mr-1' /> Add Reason
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
            {isSubmitting && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            {isSubmitting ? "Adding..." : "Add Course"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
