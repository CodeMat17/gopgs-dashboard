"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { RichTextEditor } from "../RichTextEditor";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Input } from "../ui/input";

interface CourseMaterial {
  title: string;
  file: Id<"_storage">;
}

interface UpdateCourseProps {
  c_id: Id<"courses">;
  c_course: string;
  c_duration: string;
  c_mode: string;
  c_overview: string;
  c_whyChoose: WhyChooseItem[];
  c_faculty: Faculty;
  c_type: CourseType;
  c_courseMaterials: CourseMaterial[];
}

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
const courseTypeOptions: CourseType[] = ["pgd", "masters", "phd"];

const durationOptions = ["12 Months", "18 Months", "24 Months"] as const;
const modeOptions = ["On-line", "On-campus", "On-line & On-campus"] as const;

interface WhyChooseItem {
  title: string;
  description: string;
}

const FileDownloadLink = ({ fileId }: { fileId: Id<"_storage"> }) => {
  const fileUrl = useQuery(api.courses.getFileUrl, { fileId });

  if (!fileUrl) return null;

  return (
    <a
      href={fileUrl}
      download
      className='text-blue-600 hover:underline text-sm block'>
      Download PDF
    </a>
  );
};

const UpdateCourse = ({
  c_id,
  c_course,
  c_duration,
  c_mode,
  c_overview,
  c_whyChoose,
  c_faculty,
  c_type,
  c_courseMaterials,
}: UpdateCourseProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fileLoading, setFileLoading] = useState(false);
  const [newMaterial, setNewMaterial] = useState<{
    title: string;
    file?: File;
  }>({ title: "" });

  const updateCourse = useMutation(api.courses.updateCourse);
  const generateUploadUrl = useMutation(api.courses.generateUploadUrl);

  // State management
  const [course, setCourse] = useState(c_course);
  const [duration, setDuration] = useState(c_duration);
  const [mode, setMode] = useState(c_mode);
  const [overview, setOverview] = useState(c_overview);
  const [whyChoose, setWhyChoose] = useState(c_whyChoose);
  const [faculty, setFaculty] = useState<Faculty>(c_faculty);
  const [type, setType] = useState<CourseType>(c_type);
  const [materials, setMaterials] = useState(c_courseMaterials);

  const handleAddMaterial = async () => {
    if (!newMaterial.title.trim() || !newMaterial.file) return;

    try {
      setFileLoading(true);
      const postUrl = await generateUploadUrl();
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": newMaterial.file.type },
        body: newMaterial.file,
      });
      const { storageId } = await result.json();

      setMaterials((prev) => [
        ...prev,
        {
          title: newMaterial.title.trim(),
          file: storageId as Id<"_storage">,
        },
      ]);
      setNewMaterial({ title: "", file: undefined });
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Upload failed", {
        description: "Failed to upload PDF file",
      });
    } finally {
      setFileLoading(false);
    }
  };

  const updateItemField = <T extends object, K extends keyof T>(
    setItems: React.Dispatch<React.SetStateAction<T[]>>,
    index: number,
    field: K,
    value: T[K]
  ) =>
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );

  const handleSave = async () => {
    setLoading(true);
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
        courseMaterials: materials,
      });
      setOpen(false);
      toast.success("Course updated successfully");
    } catch (error) {
      console.error("Update failed:", error);
      toast.error("Update failed", { description: "Failed to update course" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant='outline' className='w-full'>
          Update Course
        </Button>
      </DialogTrigger>
      <DialogContent className='max-w-2xl max-h-[calc(100vh-4rem)] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Update Course Details</DialogTitle>
        </DialogHeader>

        <div className='space-y-6 py-4'>
          {/* Faculty Selector */}
          <Select
            value={faculty}
            onValueChange={(v) => setFaculty(v as Faculty)}>
            <SelectTrigger>
              <SelectValue placeholder='Select Faculty' />
            </SelectTrigger>
            <SelectContent>
              {facultyOptions.map((fac) => (
                <SelectItem key={fac} value={fac}>
                  {fac}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Course Type Selector */}
          <Select value={type} onValueChange={(v) => setType(v as CourseType)}>
            <SelectTrigger>
              <SelectValue placeholder='Select Course Type' />
            </SelectTrigger>
            <SelectContent>
              {courseTypeOptions.map((ct) => (
                <SelectItem key={ct} value={ct}>
                  {ct.toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Course Name */}
          <Input
            value={course}
            onChange={(e) => setCourse(e.target.value)}
            placeholder='Course Name'
          />

          {/* Duration Selector */}
          <Select value={duration} onValueChange={setDuration}>
            <SelectTrigger>
              <SelectValue placeholder='Select Duration' />
            </SelectTrigger>
            <SelectContent>
              {durationOptions.map((dur) => (
                <SelectItem key={dur} value={dur}>
                  {dur}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Mode Selector */}
          <Select value={mode} onValueChange={setMode}>
            <SelectTrigger>
              <SelectValue placeholder='Select Mode' />
            </SelectTrigger>
            <SelectContent>
              {modeOptions.map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Overview Editor */}
          <RichTextEditor value={overview} onChange={setOverview} />

          {/* Why Choose Section */}
          <div className='space-y-2'>
            <label className='text-sm font-medium'>
              Why Choose This Course
            </label>
            {whyChoose.map((item, idx) => (
              <div key={idx} className='p-3 border rounded-md space-y-2'>
                <Input
                  value={item.title}
                  placeholder='Reason Title'
                  onChange={(e) =>
                    updateItemField(setWhyChoose, idx, "title", e.target.value)
                  }
                />
                <Input
                  value={item.description}
                  placeholder='Reason Description'
                  onChange={(e) =>
                    updateItemField(
                      setWhyChoose,
                      idx,
                      "description",
                      e.target.value
                    )
                  }
                />
                <Button
                  variant='destructive'
                  size='sm'
                  onClick={() =>
                    setWhyChoose((prev) => prev.filter((_, i) => i !== idx))
                  }>
                  Remove
                </Button>
              </div>
            ))}
            <Button
              variant='outline'
              size='sm'
              onClick={() =>
                setWhyChoose((prev) => [
                  ...prev,
                  { title: "", description: "" },
                ])
              }>
              Add Reason
            </Button>
          </div>

          {/* Course Materials Section */}
          <div className='space-y-2'>
            <label className='text-sm font-medium'>Course Materials</label>

            {materials.map((mat, idx) => (
              <div key={mat.file} className='p-3 border rounded-md space-y-2'>
                <Input
                  value={mat.title}
                  placeholder='Material Title'
                  onChange={(e) =>
                    updateItemField(setMaterials, idx, "title", e.target.value)
                  }
                />
                <FileDownloadLink fileId={mat.file} />
                <Button
                  variant='destructive'
                  size='sm'
                  onClick={() =>
                    setMaterials((prev) => prev.filter((_, i) => i !== idx))
                  }>
                  Remove
                </Button>
              </div>
            ))}

            <div className='space-y-2'>
              <Input
                value={newMaterial.title}
                placeholder='New Material Title'
                onChange={(e) =>
                  setNewMaterial((prev) => ({ ...prev, title: e.target.value }))
                }
              />
              <Input
                type='file'
                accept='application/pdf'
                onChange={(e) =>
                  setNewMaterial((prev) => ({
                    ...prev,
                    file: e.target.files?.[0],
                  }))
                }
              />
              <Button
                onClick={handleAddMaterial}
                disabled={
                  !newMaterial.title || !newMaterial.file || fileLoading
                }>
                {fileLoading ? (
                  <Loader2 className='animate-spin' />
                ) : (
                  "Add Material"
                )}
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter className='gap-2'>
          <DialogClose asChild>
            <Button variant='secondary' disabled={loading}>
              Cancel
            </Button>
          </DialogClose>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? <Loader2 className='animate-spin' /> : "Update Course"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateCourse;
