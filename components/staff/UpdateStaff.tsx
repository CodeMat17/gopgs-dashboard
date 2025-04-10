"use client";

import { Doc, Id } from "@/convex/_generated/dataModel";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { RichTextEditor } from "../RichTextEditor";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { StaffFormValues } from "./formSchema";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

interface UpdateStaffProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: StaffFormValues) => void;
  isSubmitting: boolean;
  staff: Doc<"staff"> & { imageUrl?: string };
  imageUrl?: string;
}

export function UpdateStaff({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
  staff,
  // imageUrl,
}: UpdateStaffProps) {
  const generateUploadUrl = useMutation(api.staff.generateUploadUrl);

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    staff.imageUrl || null
  );
  const imageInput = useRef<HTMLInputElement | null>(null);

  const [formData, setFormData] = useState({
    name: staff?.name || "",
    role: staff?.role || "",
    email: staff?.email || "",
    linkedin: staff?.linkedin || "",
    profile: staff?.profile || "",
    body: staff?.body || "",
    imageUrl: staff?.imageUrl || "",
  });

  useEffect(() => {
    if (open) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => document.body.classList.remove("overflow-hidden");
  }, [open]);

  useEffect(() => {
    if (staff) {
      setFormData({
        name: staff.name || "",
        role: staff.role || "",
        email: staff.email || "",
        linkedin: staff.linkedin || "",
        profile: staff.profile || "",
        imageUrl: staff?.imageUrl || "",
        body: staff.body || "",
      });
      setPreviewUrl(staff.imageUrl || null);
    }
  }, [staff]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("Submitting Form Data:", formData); // Debugging step

    let updatedBody = formData.body;

    if (selectedImage) {
      try {
        const uploadUrl = await generateUploadUrl();

        const response = await fetch(uploadUrl, {
          method: "POST",
          body: selectedImage,
        });

        if (!response.ok) {
          throw new Error("Image upload failed");
        }

        const { storageId }: { storageId: Id<"_storage"> } =
          await response.json();
        updatedBody = storageId;
      } catch (error) {
        console.error("Upload failed:", error);
        return;
      }
    }

    onSubmit({
      ...formData,
      linkedin: formData.linkedin,
      storageId: updatedBody,
    });
  };

  if (!staff) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className='fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-center items-center py-4'
          onClick={() => onOpenChange(false)}>
          <motion.div
            className='bg-white dark:bg-gray-950 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6'
            onClick={(e) => e.stopPropagation()}>
            <div className='flex justify-between items-center'>
              <h2 className='text-2xl font-bold'>Update {staff.name}</h2>
              <button
                onClick={() => onOpenChange(false)}
                className='p-2 hover:bg-gray-200 rounded-full transition'>
                <X className='w-5 h-5' />
              </button>
            </div>

            <form onSubmit={handleSubmit} className='space-y-4'>
              <div className='space-y-2'>
                <label className='text-sm text-gray-500'>Name</label>
                <Input
                  name='name'
                  value={formData.name}
                  onChange={handleChange}
                  placeholder='Staff name'
                  required
                />
              </div>
              <div className='space-y-2'>
                <label className='text-sm text-gray-500'>Role</label>
                <Input
                  name='role'
                  value={formData.role}
                  onChange={handleChange}
                  placeholder='Staff role'
                  required
                />
              </div>
              <div className='space-y-2'>
                <label className='text-sm text-gray-500'>Email</label>
                <Input
                  name='email'
                  type='email'
                  value={formData.email}
                  onChange={handleChange}
                  placeholder='Staff email'
                  required
                />
              </div>
              <div className='space-y-2'>
                <label className='text-sm text-gray-500'>
                  LinkedIn (optional)
                </label>
                <Input
                  name='linkedin'
                  value={formData.linkedin}
                  onChange={handleChange}
                  placeholder='LinkedIn profile link'
                />
              </div>
              <div className='space-y-2'>
                <label className='text-sm text-gray-500'>Profile</label>
                <RichTextEditor
                  value={formData.profile}
                  onChange={(value) =>
                    setFormData((prev) => ({ ...prev, profile: value }))
                  }
                />
              </div>

              <div className='space-y-2'>
                <label className='text-sm text-gray-500'>Photo</label>
                <div className='flex flex-col items-center gap-3 p-4 border rounded-lg shadow-md'>
                  <input
                    type='file'
                    accept='image/*'
                    ref={imageInput}
                    onChange={handleFileChange}
                    className='hidden'
                  />
                  <button
                    type='button'
                    onClick={() => imageInput.current?.click()}
                    className='px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition'
                    disabled={selectedImage !== null}>
                    {selectedImage ? "Change Image" : "Upload Image"}
                  </button>
                  {previewUrl && (
                    <div className='mt-2 flex flex-col items-center gap-2'>
                      <Image
                        priority
                        src={previewUrl}
                        alt='Preview'
                        width={80}
                        height={80}
                        className='w-40 h-40 rounded-lg object-cover border'
                      />
                      <button
                        type='button'
                        onClick={() => {
                          setSelectedImage(null);
                          setPreviewUrl(staff.imageUrl || null);
                          if (imageInput.current) imageInput.current.value = "";
                        }}
                        className='text-red-500 hover:text-red-700 text-sm'>
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className='flex items-center gap-4 pt-4'>
                <Button
                  variant='outline'
                  className='w-full'
                  onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button
                  type='submit'
                  className='w-full'
                  disabled={isSubmitting}>
                  {isSubmitting ? "Updating..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
