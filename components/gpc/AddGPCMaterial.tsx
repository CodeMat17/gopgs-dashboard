"use client";

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

const AddGPCMaterial = () => {
  const [open, setOpen] = useState(false);
  const [faculty, setFaculty] = useState<Faculty>();
  const [type, setType] = useState<CourseLevel>();
  const [semester, setSemester] = useState<1 | 2>(); // Add semester state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const addGPC = useMutation(api.gpc.addGPC);
    const generateUploadUrl = useMutation(api.gpc.generateUploadUrl);
    
  const handleSubmit = async () => {
    try {
      setIsLoading(true);

      // Validate all required fields including semester
      if (!faculty || !type || !title || !description || !file || !semester) {
        toast.error("Please fill all required fields");
        return;
      }

      // Generate upload URL
      const postUrl = await generateUploadUrl();
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      const { storageId } = await result.json();

      // Add material with semester
      await addGPC({
        faculty,
        type,
        title,
        description,
        storageId,
        semester, // Add semester to the mutation
      });

      toast.success("Done!", {description: "Material added successfully"});
      setOpen(false);
      // Reset form
      setFaculty(undefined);
      setType(undefined);
      setSemester(undefined);
      setTitle("");
      setDescription("");
      setFile(null);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error!", { description: "Submission failed" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className='gap-2'>Add GPC Material</Button>
      </DialogTrigger>
      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle>Add New GPC Material</DialogTitle>
        </DialogHeader>

        <div className='space-y-4'>
          {/* Faculty Selector */}
          <Select
            value={faculty}
            onValueChange={(v) => setFaculty(v as Faculty)}
            required>
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

          {/* Course Type Selector */}
          <Select
            value={type}
            onValueChange={(v) => setType(v as CourseLevel)}
            required>
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

          {/* Semester Selector */}
          <Select
            value={semester?.toString()} // Convert number to string for Select
            onValueChange={(v) => setSemester(Number(v) as 1 | 2)}
            required>
            <SelectTrigger>
              <SelectValue placeholder='Select Semester' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='1'>First Semester</SelectItem>
              <SelectItem value='2'>Second Semester</SelectItem>
            </SelectContent>
          </Select>

          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder='Course Title'
            required
          />

          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder='Course Description'
            required
          />

          <div className='space-y-2'>
            <label className='text-sm font-medium'>Course Material (PDF)</label>
            <Input
              type='file'
              accept='application/pdf'
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              required
            />
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant='outline'>Cancel</Button>
          </DialogClose>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? <Loader2 className='animate-spin' /> : "Add Material"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddGPCMaterial;
