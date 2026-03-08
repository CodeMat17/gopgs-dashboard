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
import { ImagePlus, Loader2, Pencil, X } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Badge } from "../ui/badge";

type ExistingPhoto = {
  source: "existing";
  url: string;
  storageId: Id<"_storage">;
};

type NewPhoto = {
  source: "new";
  previewUrl: string;
  storageId: Id<"_storage"> | null;
  uploading: boolean;
  file: File;
};

type PhotoEntry = ExistingPhoto | NewPhoto;

const MAX_SIZE = 2 * 1024 * 1024;

type SpotlightData = {
  _id: Id<"postgradSpotlight">;
  name: string;
  program: string;
  faculty: string;
  bio: string;
  achievement?: string;
  photos: { url: string; storageId: Id<"_storage"> }[];
};

const UpdateSpotlight = ({ spotlight }: { spotlight: SpotlightData }) => {
  const updateSpotlight = useMutation(api.postgradPen.updateSpotlight);
  const generateUploadUrl = useMutation(api.postgradPen.generateUploadUrl);

  const [open, setOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(spotlight.name);
  const [program, setProgram] = useState(spotlight.program);
  const [faculty, setFaculty] = useState(spotlight.faculty);
  const [bio, setBio] = useState(spotlight.bio);
  const [achievement, setAchievement] = useState(spotlight.achievement ?? "");
  const [photos, setPhotos] = useState<PhotoEntry[]>(
    spotlight.photos.map((p) => ({
      source: "existing" as const,
      url: p.url,
      storageId: p.storageId,
    }))
  );
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

    const newEntries: NewPhoto[] = validFiles.map((file) => ({
      source: "new" as const,
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
            p.source === "new" && p.file === file
              ? { ...p, storageId: result.storageId, uploading: false }
              : p
          )
        );
      } catch {
        toast.error(`Failed to upload ${file.name}`);
        setPhotos((prev) => {
          const entry = prev.find((p) => p.source === "new" && p.file === file);
          if (entry && entry.source === "new") URL.revokeObjectURL(entry.previewUrl);
          return prev.filter((p) => !(p.source === "new" && p.file === file));
        });
      }
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => {
      const entry = prev[index];
      if (entry.source === "new") URL.revokeObjectURL(entry.previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  };

  const getPhotoUrl = (p: PhotoEntry) =>
    p.source === "existing" ? p.url : p.previewUrl;

  const handleSave = async () => {
    if (!name) return toast.error("Enter the student name");
    if (!program) return toast.error("Enter the program");
    if (!faculty) return toast.error("Enter the faculty");
    if (!bio) return toast.error("Enter a bio");
    if (photos.length === 0) return toast.error("At least one photo is required");
    if (photos.some((p) => p.source === "new" && p.uploading))
      return toast.error("Please wait for photos to finish uploading");

    const storageIds = photos
      .filter((p): p is ExistingPhoto | (NewPhoto & { storageId: Id<"_storage"> }) =>
        p.storageId !== null
      )
      .map((p) => p.storageId!);

    setPosting(true);
    try {
      await updateSpotlight({
        id: spotlight._id,
        name,
        program,
        faculty,
        bio,
        achievement: achievement || undefined,
        storageIds,
      });
      toast.success("Spotlight updated");
      setOpen(false);
    } catch (error) {
      toast.error("Failed to update", { description: `${error}` });
    } finally {
      setPosting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Pencil size={14} />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit Spotlight</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-5 py-4 pr-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Full Name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Program</label>
              <Input value={program} onChange={(e) => setProgram(e.target.value)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Faculty</label>
            <Input value={faculty} onChange={(e) => setFaculty(e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Bio</label>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Achievement / Quote (optional)</label>
            <Textarea
              value={achievement}
              onChange={(e) => setAchievement(e.target.value)}
              rows={2}
            />
          </div>

          {/* Photos */}
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
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={posting}>
                <ImagePlus className="w-4 h-4 mr-1.5" />
                Add Photos
              </Button>
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
                      src={getPhotoUrl(photo)}
                      alt={`Photo ${i + 1}`}
                      fill
                      className="object-cover"
                    />
                    {photo.source === "new" && photo.uploading && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Loader2 className="h-5 w-5 text-white animate-spin" />
                      </div>
                    )}
                    {photo.source === "existing" && (
                      <Badge className="absolute top-1 left-1 text-[10px] py-0 px-1.5 h-5">
                        Saved
                      </Badge>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(i)}
                      disabled={photo.source === "new" && photo.uploading}
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
              </button>
            )}
          </div>
        </div>

        <DialogFooter className="pt-4 border-t gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={posting || photos.some((p) => p.source === "new" && p.uploading)}>
            {posting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateSpotlight;
