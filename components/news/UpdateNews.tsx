"use client";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { ImagePlus, Minus, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { RichTextEditor } from "../RichTextEditor";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

const UpdateNews = ({ slug }: { slug: string }) => {
  const selectedNews = useQuery(api.news.getNewsBySlug, { slug });
  const updateNews = useMutation(api.news.updateNews);
  const generateUploadUrl = useMutation(api.news.generateUploadUrl);

  const [open, setOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [storageId, setStorageId] = useState<Id<"_storage"> | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    if (selectedNews) {
      setTitle(selectedNews.title);
      setAuthor(selectedNews.author);
      setContent(selectedNews.content);
      setPreviewUrl(selectedNews.coverImage);
    }
  }, [selectedNews]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      toast.error("Error!", { description: "Image must be less than 1MB" });
      return;
    }

    try {
      setIsUploading(true);

      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);

      const uploadUrl = await generateUploadUrl();

      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!response.ok) throw new Error("Upload failed");
      const result = await response.json();
      setStorageId(result.storageId);
    } catch (error) {
      toast.error("Upload failed", { description: `${error}` });
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleRemoveImage = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setStorageId(null);
  };

  const handlePost = async () => {
    if (!selectedNews?._id) return;
    if (!title) return toast.error("Error!", { description: "Enter title" });
    if (!author) return toast.error("Error!", { description: "Enter author" });
    if (!content)
      return toast.error("Error!", { description: "Enter content" });

    setPosting(true);
    try {
      await updateNews({
        id: selectedNews._id,
        title,
        author,
        content,
        storageId: storageId || selectedNews.storageId || undefined,
      });

      toast.success("Success!", { description: "News updated successfully" });
    } catch (error) {
      toast.error("Error!", { description: `${error}` });
    } finally {
      setPosting(false);
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant='outline' className='w-full'>
          Update News
        </Button>
      </DialogTrigger>
      <DialogContent className='max-w-2xl max-h-[calc(100vh-4rem)] flex flex-col'>
        <DialogHeader>
          <DialogTitle>Update News</DialogTitle>
        </DialogHeader>
        <div className='space-y-4 overflow-y-auto flex-1 py-4'>
          <div className='space-y-1'>
            <label className='text-sm text-muted-foreground'>Title</label>
            <Input
              placeholder='News title'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className='space-y-1'>
            <label className='text-sm text-muted-foreground'>Author</label>
            <Input
              placeholder='Author name'
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
            />
          </div>

          <div className='space-y-1'>
            <label className='text-sm text-muted-foreground'>Cover Image</label>
            <div className='flex items-center gap-4'>
              <input
                type='file'
                accept='image/*'
                onChange={handleFileSelect}
                ref={fileInputRef}
                className='hidden'
                disabled={isUploading}
              />
              <Button
                variant='outline'
                type='button'
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}>
                <ImagePlus className='w-4 h-4 mr-2' />
                {previewUrl ? "Change Image" : "Upload Image"}
              </Button>
              {isUploading && <span className='text-sm'>Uploading...</span>}
            </div>

            {previewUrl && (
              <div className='relative mt-2 w-32 h-32'>
                <Image
                  src={previewUrl}
                  alt='Preview'
                  fill
                  className='rounded-lg object-cover w-full h-full'
                />
                <button
                  type='button'
                  onClick={handleRemoveImage}
                  className='absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1'>
                  <X className='w-4 h-4' />
                </button>
              </div>
            )}
          </div>

          <div className='space-y-1'>
            <label className='text-sm text-muted-foreground'>Content</label>
            <RichTextEditor
              value={content}
              onChange={(newContent) => setContent(newContent)}
            />
          </div>
        </div>

        <DialogFooter className='gap-2 pt-4 border-t'>
          <Button variant='outline' onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handlePost} disabled={posting}>
            {posting ? <Minus className='animate-spin' /> : "Update"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateNews;
