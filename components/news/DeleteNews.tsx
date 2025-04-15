"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { Minus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";

const DeleteNews = ({ id, title }: { id: Id<"news">; title: string }) => {
  const deleteNews = useMutation(api.news.deleteNews);
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!id) return;
    setDeleting(true);
    try {
      await deleteNews({ id });
      toast.success("Done!", {
        description: "The news has been deleted successfully",
      });
    } catch (error) {
      toast.error("Error!", { description: "Failed to delete news" });
      console.log("Error Msg: ", error);
    } finally {
      setDeleting(false);
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className='w-full bg-red-500 hover:bg-red-700 text-white'>
          Delete
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete News</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the news titled:
            <span className='font-medium'>{title}</span>?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className='flex gap-2'>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDelete}
            className='bg-red-500 hover:bg-red-700 text-white'>
            {deleting ? <Minus className='animate-spin' /> : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteNews;
