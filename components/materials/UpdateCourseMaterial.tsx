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
import { useMutation } from "convex/react";
import { Edit, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
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

const validFaculties = [
  "Faculty of Arts",
  "Faculty of Education",
  "Faculty of Mgt. & Social Sciences",
  "Faculty of Nat. Science & Environmental Studies",
  "Faculty of Law",
] as const;

const validCourseLevels = ["pgd", "masters", "phd"] as const;

type Faculty = (typeof validFaculties)[number];
type CourseLevel = (typeof validCourseLevels)[number];

interface UpdateCourseProps {
  c_id: Id<"materials">;
  c_title: string;
  c_faculty: Faculty;
  c_description: string;
  c_type: CourseLevel;
  c_semester: 1 | 2;
  c_fileId: Id<"_storage">;
}

const UpdateCourseMaterial = ({
  c_id,
  c_title,
  c_faculty,
  c_description,
  c_semester,
  c_type,
  c_fileId,
}: UpdateCourseProps) => {
  const [open, setOpen] = useState(false);
  const [faculty, setFaculty] = useState<Faculty>(c_faculty);
  const [type, setType] = useState<CourseLevel>(c_type);
  const [title, setTitle] = useState(c_title);
  const [description, setDescription] = useState(c_description);
  const [semester, setSemester] = useState<1 | 2>(c_semester);
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const updateCourse = useMutation(api.materials.updateCourse);
  const generateUploadUrl = useMutation(api.materials.generateUploadUrl);

  const handleSubmit = async () => {
    try {
      setIsLoading(true);

      // Validate required fields first
      if (!faculty || !type || !title || !description || !semester) {
        toast.error("Validation Error", {
          description: "All fields are required",
        });
        return;
      }

      let newFileId: Id<"_storage"> | undefined;

      if (file) {
        const postUrl = await generateUploadUrl();
        const result = await fetch(postUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });

        const response = await result.json();
        newFileId = response.storageId;
      }

      // Ensure we have either existing file or new file
      const fileId = newFileId || c_fileId;
      if (!fileId) {
        toast.error("Validation Error", {
          description: "File attachment is required",
        });
        return;
      }

      await updateCourse({
        id: c_id,
        faculty,
        type,
        title,
        description,
        semester,
        file: newFileId || c_fileId,
      });

      toast.success("Success", {
        description: "Material updated successfully",
      });
      setOpen(false);
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Error!", { description: "Failed to update material" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size='icon' variant='ghost'>
          <Edit className='w-4 h-4' />
        </Button>
      </DialogTrigger>
      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle>Update Course Material</DialogTitle>
        </DialogHeader>

        <div className='space-y-4 overflow-y-scroll flex-1 h-[calc(100vh-14rem)]'>
          <div className='space-y-1'>
            <label className='text-muted-foreground text-sm '>Faculty</label>
            <Select
              value={faculty}
              onValueChange={(v) => setFaculty(v as Faculty)}>
              <SelectTrigger>
                <SelectValue placeholder='Select Faculty' />
              </SelectTrigger>
              <SelectContent>
                {validFaculties.map((faculty) => (
                  <SelectItem key={faculty} value={faculty}>
                    {faculty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-1'>
            <label className='text-muted-foreground text-sm '>
              Program type
            </label>
            <Select
              value={type}
              onValueChange={(v) => setType(v as CourseLevel)}>
              <SelectTrigger>
                <SelectValue placeholder='Select Course Type' />
              </SelectTrigger>
              <SelectContent>
                {validCourseLevels.map((level) => (
                  <SelectItem key={level} value={level}>
                    {level.toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

           <div className="space-y-1">
            <label className="text-muted-foreground text-sm ">Course title</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder='Course Title'
            />
            </div>

           <div className="space-y-1">
            <label className="text-muted-foreground text-sm ">Course description</label>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder='Course Description'
            />
            </div>

           <div className="space-y-1">
            <label className="text-muted-foreground text-sm ">Semester</label>
          <Select
            value={semester.toString()}
            onValueChange={(v) => setSemester(Number(v) as 1 | 2)}>
            <SelectTrigger>
              <SelectValue placeholder='Select Semester' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='1'>First Semester</SelectItem>
              <SelectItem value='2'>Second Semester</SelectItem>
            </SelectContent>
            </Select>
            </div>

          <div className='space-y-1'>
            <label className='text-sm text-muted-foreground'>Course Material (PDF)</label>
            <Input
              type='file'
              accept='application/pdf'
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            <p className='text-muted-foreground text-sm'>
              Leave empty to keep current file
            </p>
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant='outline'>Cancel</Button>
          </DialogClose>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className='animate-spin' />
            ) : (
              "Update Material"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateCourseMaterial;
