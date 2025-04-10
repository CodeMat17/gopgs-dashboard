"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Loader2, Trash2, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Id } from "@/convex/_generated/dataModel";

interface ImageUploadProps {
  storageId?: Id<"_storage"> | null;
  onUpload: (file: File) => Promise<void>;
  onRemove: () => void;
  error?: string;
}

export function ImageUpload({
  storageId,
  onUpload,
  onRemove,
  error,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setLocalPreview(URL.createObjectURL(file));

    try {
      await onUpload(file);
    } catch (error) {
      console.error("Failed to upload file:", error);
      setLocalPreview(null);
      if (inputRef.current) inputRef.current.value = "";
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    setLocalPreview(null);
    onRemove();
  };

  const previewUrl =
    localPreview || (storageId ? `/api/storage/${storageId}` : null);

  return (
    <div className='space-y-2'>
      <div className='relative group w-48 h-48 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden'>
        {previewUrl ? (
          <>
            <Image
              src={previewUrl}
              alt='Preview'
              fill
              className='object-cover'
              sizes='192px'
            />
            <div className='absolute inset-0 bg-black/50 flex items-center justify-center'>
              <Button
                variant='destructive'
                size='sm'
                onClick={handleRemove}
                disabled={isUploading}>
                <Trash2 className='w-4 h-4 mr-2' />
                Remove
              </Button>
            </div>
          </>
        ) : (
          <label className='flex flex-col items-center justify-center w-full h-full cursor-pointer p-4'>
            {isUploading ? (
              <Loader2 className='w-8 h-8 animate-spin text-gray-400' />
            ) : (
              <>
                <UploadCloud className='w-8 h-8 mb-2 text-gray-400' />
                <span className='text-sm text-gray-500 text-center'>
                  Click to upload image
                </span>
              </>
            )}
            <input
              ref={inputRef}
              type='file'
              accept='image/*'
              className='hidden'
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </label>
        )}
      </div>
      {error && <p className='text-sm text-red-500'>{error}</p>}
    </div>
  );
}
