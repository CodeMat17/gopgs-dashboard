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

interface DeleteStudentProps {
  id: string; // Change from Id<"students"> to string
  name: string;
}

export function DeleteStudent({ id, name }: DeleteStudentProps) {
  const deleteStudent = useMutation(api.students.deleteStudent);

  const [open, setOpen] = useState(false);
  const [isDeleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!id)
      toast.warning("Warning!", {
        description: "Something went wrong. Try again",
      });

    setDeleting(true); // Set loading state
    try {
      await deleteStudent({ id: id as Id<"students"> });

      toast.success("Done!", {
        description: "Student data deleted successfully!",
      });
    } catch (error) {
      console.error("Failed to delete student data:", error);
      toast.error("Error!", { description: "Failed to delete student data." });
    } finally {
      setDeleting(false); // Reset loading state
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size='icon' variant='ghost'>
          <Trash2 className='text-red-500 w-4 h-4' />
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Confirm Deletion</DialogTitle>
        </DialogHeader>
        <div className='mb-6'>
          <p>
            Are you sure you want to delete this student data:{" "}
            <span className='font-medium'>{name}</span>?
          </p>
        </div>
        <DialogFooter className='flex gap-3'>
          <Button
            variant='destructive'
            onClick={handleDelete}
            disabled={isDeleting}>
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>

          <DialogClose asChild>
            <Button>Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
