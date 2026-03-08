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
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { ImagePlus, Loader2, Plus, X } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { toast } from "sonner";

type PhotoEntry = {
  previewUrl: string;
  storageId: Id<"_storage"> | null;
  uploading: boolean;
  file: File;
};

const MAX_SIZE = 2 * 1024 * 1024;

const AddSpotlight = () => {
  const addSpotlight = useMutation(api.postgradPen.addSpotlight);
  const generateUploadUrl = useMutation(api.postgradPen.generateUploadUrl);

  const [open, setOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [program, setProgram] = useState("");
  const [faculty, setFaculty] = useState("");
  const [bio, setBio] = useState("");
  const [achievement, setAchievement] = useState("");
  const [photos, setPhotos] = useState<PhotoEntry[]>([]);
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

    const newEntries: PhotoEntry[] = validFiles.map((file) => ({
      previewUrl: URL.createObjectURL(file),
      storageId: null,
      uploading: true,
      file,
    }));

    setPhotos((prev) => [...prev, ...newEntries]);

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
        setPhotos((prev) =>
          prev.map((p) =>
            p.file === file ? { ...p, storageId: result.storageId, uploading: false } : p
          )
        );
      } catch {
        toast.error(`Failed to upload ${file.name}`);
        setPhotos((prev) => {
          const entry = prev.find((p) => p.file === file);
          if (entry) URL.revokeObjectURL(entry.previewUrl);
          return prev.filter((p) => p.file !== file);
        });
      }
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => {
      const entry = prev[index];
      URL.revokeObjectURL(entry.previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  };

  const resetForm = () => {
    photos.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    setName("");
    setProgram("");
    setFaculty("");
    setBio("");
    setAchievement("");
    setPhotos([]);
  };

  const handlePost = async () => {
    if (!name) return toast.error("Enter the student name");
    if (!program) return toast.error("Enter the program");
    if (!faculty) return toast.error("Enter the faculty");
    if (!bio) return toast.error("Enter a bio");
    if (photos.length === 0) return toast.error("Upload at least one photo");
    if (photos.some((p) => p.uploading))
      return toast.error("Please wait for photos to finish uploading");

    const storageIds = photos
      .filter((p) => p.storageId !== null)
      .map((p) => p.storageId!);

    setPosting(true);
    try {
      await addSpotlight({
        name,
        program,
        faculty,
        bio,
        achievement: achievement || undefined,
        storageIds,
      });
      toast.success("Spotlight added");
      resetForm();
      setOpen(false);
    } catch (error) {
      toast.error("Failed to add spotlight", { description: `${error}` });
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
        <Button variant="outline" className="gap-2">
          <Plus size={16} />
          Add Spotlight
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Add Postgrad Spotlight</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-5 py-4 pr-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Full Name</label>
              <Input
                placeholder="Student name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Program</label>
              <Input
                placeholder="e.g. MSc Computer Science"
                value={program}
                onChange={(e) => setProgram(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Faculty</label>
            <Input
              placeholder="e.g. Faculty of Arts"
              value={faculty}
              onChange={(e) => setFaculty(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Bio</label>
            <Textarea
              placeholder="Short biography or introduction..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Achievement / Quote (optional)</label>
            <Textarea
              placeholder="Notable achievement or personal quote..."
              value={achievement}
              onChange={(e) => setAchievement(e.target.value)}
              rows={2}
            />
          </div>

          {/* Photo Upload */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">
                Photos
                {photos.length > 0 && (
                  <span className="ml-1.5 text-muted-foreground font-normal">
                    ({photos.length})
                  </span>
                )}
              </label>
              {photos.length > 0 && (
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

            {photos.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {photos.map((photo, i) => (
                  <div
                    key={i}
                    className="relative aspect-square rounded-lg overflow-hidden border bg-muted">
                    <Image
                      src={photo.previewUrl}
                      alt={`Photo ${i + 1}`}
                      fill
                      className="object-cover"
                    />
                    {photo.uploading && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Loader2 className="h-5 w-5 text-white animate-spin" />
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(i)}
                      disabled={photo.uploading}
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
                <span className="text-sm font-medium">Click to upload photos</span>
                <span className="text-xs">PNG, JPG, WEBP — up to 2MB each</span>
              </button>
            )}
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
            disabled={posting || photos.some((p) => p.uploading)}>
            {posting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Add Spotlight"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddSpotlight;
