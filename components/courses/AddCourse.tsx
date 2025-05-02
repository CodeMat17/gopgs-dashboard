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
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

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

export default function AddCourseModal() {
  const [open, setOpen] = useState(false);
  const [faculty, setFaculty] = useState<Faculty>();
  const [type, setType] = useState<CourseLevel>();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const generateUploadUrl = useMutation(api.materials.generateUploadUrl);
  const addMaterial = useMutation(api.materials.addMaterial);

  const handleSubmit = async () => {
    setError("");

    if (!faculty) {
      setError("Please select faculty");
      toast.error("Error!", { description: "Please select faculty" });
      return;
    }

    if (!type) {
      setError("Please select program type");
      toast.error("Error!", { description: "Please select program type" });
      return;
    }

    if (!title) {
      setError("Please add course title");
      toast.error("Error!", { description: "Please add course title" });
      return;
    }

    if (!description) {
      setError("Please please add course description");
      toast.error("Error!", { description: "Please add course description" });
      return;
    }

    if (!file) {
      setError("Please select a PDF file");
      toast.error("Error!", { description: "Please select a PDF file" });
      return;
    }

    if (file.type !== "application/pdf") {
      setError("Only PDF files are allowed");
      toast.error("Error!", { description: "Only PDF files are allowed" });
      return;
    }

    try {
      setIsLoading(true);

      const postUrl = await generateUploadUrl();
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      const { storageId } = await result.json();

      await addMaterial({
        faculty,
        type,
        title,
        description,
        storageId,
      });

      toast("Done!", {
        description: "Material has been uploaded successfully",
      });

      // Reset form
      setFaculty(undefined);
      setType(undefined);
      setTitle("");
      setDescription("");
      setFile(null);
      setOpen(false);
    } catch (err) {
      console.log("Error Msg: ", err);
      setError("Failed to upload material. Please try again.");
    } finally {
      setIsLoading(false);
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
          <div className='space-y-6'>
            <div className='space-y-4'>
              <div>
                <label className='block mb-2 font-medium'>Faculty</label>
                <Select
                  value={faculty}
                  onValueChange={(value) => setFaculty(value as Faculty)}>
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder='Select faculty' />
                  </SelectTrigger>
                  <SelectContent>
                    {validFaculties.map((f) => (
                      <SelectItem key={f} value={f}>
                        {f}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className='block mb-2 font-medium'>Program Type</label>
                <Select
                  value={type}
                  onValueChange={(value) => setType(value as CourseLevel)}>
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder='Select program type' />
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

              <div>
                <label className='block mb-2 font-medium'>Title</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder='Material title'
                />
              </div>

              <div>
                <label className='block mb-2 font-medium'>Description</label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder='Material description'
                />
              </div>

              <div>
                <label className='block mb-2 font-medium'>PDF File</label>
                <Input
                  type='file'
                  accept='application/pdf'
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className='cursor-pointer'
                />
              </div>
            </div>

            {error && <p className='text-destructive text-center'>{error}</p>}

            {/* <Button type='submit' className='w-full py-6' disabled={isLoading}>
          {isLoading ? "Uploading..." : "Upload Material"}
        </Button> */}
          </div>
        </div>

        <DialogFooter className='sm:justify-end gap-2'>
          <DialogClose asChild>
            <Button type='button' variant='secondary'>
              Cancel
            </Button>
          </DialogClose>
          <Button type='button' onClick={handleSubmit} disabled={isLoading}>
            {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            {isLoading ? "Adding..." : "Add Course"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
