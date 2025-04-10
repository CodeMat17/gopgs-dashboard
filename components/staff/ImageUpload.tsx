"use client";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";

interface ImageUploadProps {
  storageId: Id<"_storage"> | null;
  onUploadComplete: (newStorageId: Id<"_storage"> | null) => void;
}

export function ImageUpload({ storageId, onUploadComplete }: ImageUploadProps) {
  const generateUploadUrl = useMutation(api.staff.generateUploadUrl);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const url = await generateUploadUrl();
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await response.json();
      onUploadComplete(storageId as Id<"_storage">);
    } catch (error) {
      toast.error("Image upload failed");
      onUploadComplete(null);
      console.log(error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className='space-y-2'>
      <label className='relative flex items-center justify-center w-full aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors cursor-pointer'>
        {storageId ? (
          <>
            <div className='relative w-full aspect-auto'>
              <Image
                src={`/api/storage/${storageId}`}
                alt='Upload preview'
                fill
                className='w-full h-full object-cover rounded-lg'
              />
            </div>

            <Button
              variant='destructive'
              size='sm'
              className='absolute top-2 right-2'
              onClick={(e) => {
                e.preventDefault();
                onUploadComplete(null);
              }}>
              <Trash2 className='w-4 h-4' />
            </Button>
          </>
        ) : (
          <>
            <input
              type='file'
              accept='image/*'
              className='hidden'
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleUpload(file);
              }}
              disabled={isUploading}
            />
            <div className='text-center'>
              {isUploading ? (
                <Loader2 className='w-8 h-8 animate-spin text-muted-foreground' />
              ) : (
                <>
                  <ImagePlus className='w-8 h-8 mb-2 text-muted-foreground' />
                  <p className='text-sm text-muted-foreground'>
                    Click to upload profile image
                  </p>
                </>
              )}
            </div>
          </>
        )}
      </label>
    </div>
  );
}
