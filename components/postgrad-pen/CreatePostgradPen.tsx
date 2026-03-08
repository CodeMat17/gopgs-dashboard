"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
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
import { Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { RichTextEditor } from "../RichTextEditor";

const CATEGORIES = ["Poetry", "Essay", "Fiction", "Short Story", "Memoir", "Other"];

const CreatePostgradPen = () => {
  const addPostgradPen = useMutation(api.postgradPen.addPostgradPen);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [posting, setPosting] = useState(false);

  const resetForm = () => {
    setTitle("");
    setAuthor("");
    setContent("");
    setCategory("");
  };

  const handlePost = async () => {
    if (!title) return toast.error("Enter a title");
    if (!author) return toast.error("Enter an author");
    if (!content) return toast.error("Enter content");

    setPosting(true);
    try {
      await addPostgradPen({
        title,
        author,
        content,
        category: category || undefined,
      });
      toast.success("Piece published successfully");
      resetForm();
      setOpen(false);
    } catch (error) {
      toast.error("Failed to publish", { description: `${error}` });
    } finally {
      setPosting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) resetForm();
        setOpen(o);
      }}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus size={16} />
          Add Writing
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Publish a Creative Piece</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-5 py-4 pr-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Title</label>
              <Input
                placeholder="Piece title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Author</label>
              <Input
                placeholder="Author name"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Category</label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category (optional)" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Content</label>
            <RichTextEditor value={content} onChange={setContent} />
          </div>
        </div>

        <DialogFooter className="pt-4 border-t gap-2">
          <Button
            variant="outline"
            onClick={() => {
              resetForm();
              setOpen(false);
            }}>
            Cancel
          </Button>
          <Button onClick={handlePost} disabled={posting}>
            {posting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Publishing...
              </>
            ) : (
              "Publish"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePostgradPen;
