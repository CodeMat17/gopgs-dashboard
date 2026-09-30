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
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function DeleteCourseMaterial({
  id,
  course,
}: {
  id: Id<"materials">;
  course: string;
}) {
  const deleteCourse = useMutation(api.materials.deleteCourse);

  const [open, setOpen] = useState(false);
  const [isDeleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true); // Set loading state
    try {
      await deleteCourse({ id });
      toast.success("Done!", { description: "Course deleted successfully!" });
    } catch (error) {
      console.error("Failed to delete course:", error);
      toast.error("Error!", { description: "Failed to delete course." });
    } finally {
      setDeleting(false); // Reset loading state
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size='icon' variant='ghost'>
          <Trash2 className='w-4 h-4 text-red-500' />
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Confirm Deletion</DialogTitle>
        </DialogHeader>
        <div className='mb-6'>
          <p>
            Are you sure you want to delete this course:{" "}
            <span className='font-medium'>{course}</span>?
          </p>
        </div>
        <DialogFooter className='flex gap-3'>
          <Button
            variant='destructive'
            onClick={handleDelete}
            loading={isDeleting}
            loadingText='Deleting...'>
            Delete
          </Button>

          <DialogClose asChild>
            <Button disabled={isDeleting}>Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
