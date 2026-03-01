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
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { ImagePlus, Loader2, Plus, X } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { RichTextEditor } from "../RichTextEditor";
import { Badge } from "../ui/badge";

type ImageEntry = {
  previewUrl: string;
  storageId: Id<"_storage"> | null;
  uploading: boolean;
  file: File;
};

const MAX_SIZE = 2 * 1024 * 1024; // 2MB

const CreateNews = () => {
  const createNews = useMutation(api.news.addNews);
  const generateUploadUrl = useMutation(api.news.generateUploadUrl);
  const [open, setOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState<ImageEntry[]>([]);
  const [posting, setPosting] = useState(false);

  const handleFilesSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const validFiles = files.filter((f) => {
      if (f.size > MAX_SIZE) {
        toast.error(`${f.name} exceeds 2MB limit`);
        return false;
      }
      return true;
    });

    const newEntries: ImageEntry[] = validFiles.map((file) => ({
      previewUrl: URL.createObjectURL(file),
      storageId: null,
      uploading: true,
      file,
    }));

    setImages((prev) => [...prev, ...newEntries]);

    for (const file of validFiles) {
      try {
        const uploadUrl = await generateUploadUrl();
        const response = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });
        if (!response.ok) throw new Error("Upload failed");
        const result = await response.json();
        setImages((prev) =>
          prev.map((img) =>
            img.file === file
              ? { ...img, storageId: result.storageId, uploading: false }
              : img
          )
        );
      } catch {
        toast.error(`Failed to upload ${file.name}`);
        setImages((prev) => {
          const entry = prev.find((img) => img.file === file);
          if (entry) URL.revokeObjectURL(entry.previewUrl);
          return prev.filter((img) => img.file !== file);
        });
      }
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => {
      const entry = prev[index];
      URL.revokeObjectURL(entry.previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  };

  const resetForm = () => {
    images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    setTitle("");
    setAuthor("");
    setContent("");
    setImages([]);
  };

  const handlePost = async () => {
    if (!title) return toast.error("Enter a title");
    if (!author) return toast.error("Enter an author");
    if (!content) return toast.error("Enter content");
    if (images.some((img) => img.uploading))
      return toast.error("Please wait for images to finish uploading");

    const storageIds = images
      .filter((img) => img.storageId !== null)
      .map((img) => img.storageId!);

    setPosting(true);
    try {
      await createNews({
        title,
        author,
        content,
        storageIds: storageIds.length > 0 ? storageIds : undefined,
      });
      toast.success("News published successfully");
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
          Create News
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Create News Article</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-5 py-4 pr-1">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Title</label>
              <Input
                placeholder="News title"
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

          {/* Image Upload */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">
                Images
                {images.length > 0 && (
                  <span className="ml-1.5 text-muted-foreground font-normal">
                    ({images.length} — first is cover)
                  </span>
                )}
              </label>
              {images.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={posting}>
                  <ImagePlus className="w-4 h-4 mr-1.5" />
                  Add More
                </Button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFilesSelect}
              />
            </div>

            {images.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {images.map((img, i) => (
                  <div
                    key={i}
                    className="relative aspect-video rounded-lg overflow-hidden border bg-muted">
                    <Image
                      src={img.previewUrl}
                      alt={`Image ${i + 1}`}
                      fill
                      className="object-cover"
                    />
                    {img.uploading && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Loader2 className="h-5 w-5 text-white animate-spin" />
                      </div>
                    )}
                    {i === 0 && !img.uploading && (
                      <Badge className="absolute top-1 left-1 text-[10px] py-0 px-1.5 h-5">
                        Cover
                      </Badge>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(i)}
                      disabled={img.uploading}
                      className="absolute top-1 right-1 bg-black/60 hover:bg-red-500 text-white rounded-full p-0.5 transition-colors disabled:opacity-50">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed rounded-lg p-8 flex flex-col items-center gap-2 text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors">
                <ImagePlus className="w-8 h-8" />
                <span className="text-sm font-medium">Click to upload images</span>
                <span className="text-xs">PNG, JPG, WEBP — up to 2MB each</span>
              </button>
            )}
          </div>

          {/* Content */}
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
          <Button
            onClick={handlePost}
            disabled={posting || images.some((img) => img.uploading)}>
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

export default CreateNews;
