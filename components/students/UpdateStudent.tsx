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

interface UpdateStudentProps {
  s_id: string;
  s_name: string;
  s_faculty: Faculty;
  s_regno: string;
  s_type: CourseLevel;
  s_email: string;
  s_phone: string;
}

const UpdateStudent = ({
  s_id,
  s_name,
  s_faculty,
  s_regno,
  s_email,
  s_type,
  s_phone,
}: UpdateStudentProps) => {
  const [open, setOpen] = useState(false);
  const [faculty, setFaculty] = useState<Faculty>(s_faculty);
  const [type, setType] = useState<CourseLevel>(s_type);
  const [name, setName] = useState(s_name);
  const [regno, setRegNo] = useState(s_regno);
  const [email, setEmail] = useState(s_email);
  const [phone, setPhone] = useState(s_phone);
  const [isLoading, setIsLoading] = useState(false);

  const updateStudent = useMutation(api.students.updateStudent);

  const handleSubmit = async () => {
    try {
      setIsLoading(true);

      await updateStudent({
        id: s_id as Id<"students">,
        faculty,
        type,
        name,
        email,
        regno,
        phone,
      });

      toast.success("Done", {
        description: "Student data updated successfully",
      });
      setOpen(false);
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Error!", { description: "Update failed" });
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

        <div className='space-y-4 overflow-y-scroll flex-1 h-[calc(100vh-15rem)]'>
          <div className='space-y-1'>
            <label className='text-sm text-muted-foreground'>
              Student Name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder='Add student name'
            />
          </div>

          <div className='space-y-1'>
            <label className='text-sm text-muted-foreground'>Email</label>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder='Add student email'
            />
          </div>

          <div className='space-y-1'>
            <label className='text-sm text-muted-foreground'>Reg. No</label>
            <Input
              value={regno}
              onChange={(e) => setRegNo(e.target.value)}
              placeholder='Add student reg. no'
            />
          </div>

          <div className='space-y-1'>
            <label className='text-sm text-muted-foreground'>Phone No</label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder='Add student phone no'
            />
          </div>

          <div className='flex flex-col sm:flex-row gap-4 sm:gap-2'>
            <div className='space-y-1 w-full'>
              <label className='text-sm text-muted-foreground'>Faculty</label>
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

            <div className='space-y-1 w-full'>
              <label className='text-sm text-muted-foreground'>
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
              "Update"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateStudent;
