"use client";

import { RichTextEditor } from "@/components/RichTextEditor";
import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import Image from "next/image";
import { FormEvent, useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { StaffFormValues } from "./formSchema";
import { toast } from "sonner";

type CreateStaffProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (values: StaffFormValues) => Promise<void>;
  isSubmitting: boolean;
};

export function CreateStaff({ open, onOpenChange }: CreateStaffProps) {
  const generateUploadUrl = useMutation(api.staff.generateUploadUrl);
  const sendStaffData = useMutation(api.staff.createStaff);

  const imageInput = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const MAX_SIZE_MB = 1;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [profile, setProfile] = useState("");

  const validateForm = (): boolean => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Invalid email address");
      return false;
    }
    if (linkedin && !/^https:\/\/.+/.test(linkedin)) {
      setError("LinkedIn URL must start with 'https://'");
      return false;
    }
     if (!profile.trim()) {
       setError("Profile field is required");
       return false;
    }
    if (!role.trim()) {
      setError("Role field is required");
      return false;
    }
    if (!selectedImage) {
      setError("Profile image is required");
      return false;
    }
    if (!name.trim()) {
      setError("Name field is required");
      return false;
    }

    return true;
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    // Check file size
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError("File size must be less than 1MB.");
      setSelectedImage(null);
      setPreviewUrl(null);
      return;
    }

    setError(null);
    setSelectedImage(file);
    setPreviewUrl(URL.createObjectURL(file));

    // Optimize the image if necessary
    const optimizedFile = await optimizeImage(file);

    setSelectedImage(optimizedFile);
    setPreviewUrl(URL.createObjectURL(optimizedFile));
  };

  // Optimize Image using Canvas
  const optimizeImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const img = document.createElement("img") as HTMLImageElement;
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) return resolve(file);

        const MAX_WIDTH = 800; // Adjust for optimization
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        // Scale down the image if it's too large
        if (width > MAX_WIDTH || height > MAX_HEIGHT) {
          if (width > height) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          } else {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        // Convert canvas to Blob and then to File
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(new File([blob], file.name, { type: file.type }));
            } else {
              resolve(file);
            }
          },
          file.type,
          0.7 // Compression quality (70%)
        );
      };
    });
  };

  const onSubmit = async (e: FormEvent) => {
    setIsSubmitting(true);

    e.preventDefault();

    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }

    try {
      const postUrl = await generateUploadUrl();
      const result = await fetch(postUrl, {
        method: "POST",
        headers: {
          "Content-Type": selectedImage!.type,
        },
        body: selectedImage,
      });

      const { storageId } = await result.json();

      await sendStaffData({ storageId, name, email, role, linkedin, profile });

      toast('Done!', {
        description: 'Staff added successfully'
      })

      // Reset form
      setSelectedImage(null);
      setPreviewUrl(null);
      setName("");
      setRole("");
      setEmail("");
      setLinkedin("");
      setProfile("");
      setError(null);
      if (imageInput.current) imageInput.current.value = "";

      onOpenChange(false);
    } catch (error)
    {
      toast.error("An error occurred while submitting.");
      setError("An error occurred while submitting.");
      console.log("Error occurred while submitting data: ", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (open) document.body.classList.add("overflow-hidden");
    return () => document.body.classList.remove("overflow-hidden");
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className='fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center py-4'
          onClick={() => onOpenChange(false)}>
          <motion.div
            className='bg-white dark:bg-gray-950 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto'
            onClick={(e) => e.stopPropagation()}>
            <div className='py-6 px-4 sm:px-6 space-y-6'>
              <div className='flex justify-between items-center'>
                <h2 className='text-2xl font-bold'>Add Team Member</h2>
                <button
                  onClick={() => onOpenChange(false)}
                  className='p-2 hover:bg-gray-200 rounded-full transition'>
                  <X className='w-5 h-5' />
                </button>
              </div>

              <form onSubmit={onSubmit} className='space-y-3'>
                <div className='space-y-1'>
                  <label className='text-sm text-gray-500'>Name</label>
                  <Input
                    type='text'
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className='space-y-1'>
                  <label className='text-sm text-gray-500'>Role</label>
                  <Input
                    type='text'
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    required
                  />
                </div>

                <div className='flex flex-col sm:flex-row gap-3'>
                  <div className='space-y-1 w-full'>
                    <label className='text-sm text-gray-500'>Email</label>
                    <Input
                      type='email'
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className='space-y-1 w-full'>
                    <label className='text-sm text-gray-500'>
                      LinkedIn (optional)
                    </label>
                    <Input
                      type='text'
                      value={linkedin}
                      onChange={(e) => setLinkedin(e.target.value)}
                    />
                  </div>
                </div>

                <div className='space-y-1'>
                  <label className='text-sm text-gray-500'>Profile</label>
                  <RichTextEditor value={profile} onChange={setProfile} />
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
                      {selectedImage ? "Image Selected" : "Select Image"}
                    </button>

                 

                    {previewUrl && (
                      <div className='mt-2 flex flex-col items-center gap-2'>
                        <Image
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
                            setPreviewUrl(null);
                            setError(null);
                            if (imageInput.current)
                              imageInput.current.value = "";
                          }}
                          className='text-red-500 hover:text-red-700 text-sm'>
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className='pt-4'>
                  {error && <p className='text-red-500 text-sm text-center'>{error}</p>}
                  <div className='flex items-center gap-6 mt-3'>
                    <Button
                      variant='outline'
                      className='w-full'
                      onClick={() => onOpenChange(false)}>
                      Close
                    </Button>
                    <Button
                      type='submit'
                      disabled={isSubmitting}
                      className='w-full'>
                      {isSubmitting ? "Submitting..." : "Submit"}
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
