"use client";

import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { AlumniFormValues } from "../alumni/formSchema";
import { PhoneNumberInput } from "../PhoneNumberInput";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";

interface UpdateAlumnusProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: AlumniFormValues) => void;
  isSubmitting: boolean;
  alumni: Doc<"alumni">;
}

export function UpdateAlumnus({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
  alumni,
}: UpdateAlumnusProps) {
  const generateUploadUrl = useMutation(api.staff.generateUploadUrl);

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    alumni.photo ?? null
  );
  const imageInput = useRef<HTMLInputElement | null>(null);

  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState<AlumniFormValues>({
    name: alumni.name ?? "",
    email: alumni.email ?? "",
    degree: alumni.degree ?? "",
    currentPosition: alumni.currentPosition ?? "",
    testimonial: alumni.testimonial ?? "",
    linkedin: alumni.linkedin ?? "",
    company: alumni.company ?? "",
    graduatedOn: alumni.graduatedOn ?? "",
    storageId: alumni.storageId ?? "",
    photo: alumni.photo ?? "",
    tel: alumni.tel ?? "",
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
    if (alumni) {
      setFormData({
        name: alumni.name ?? "",
        email: alumni.email ?? "",
        degree: alumni.degree ?? "",
        currentPosition: alumni.currentPosition ?? "",
        testimonial: alumni.testimonial ?? "",
        linkedin: alumni.linkedin ?? "",
        company: alumni.company ?? "",
        graduatedOn: alumni.graduatedOn ?? "",
        tel: alumni.tel ?? "",
        storageId: alumni.storageId ?? "",
        photo: alumni.photo ?? "",
      });
      setPreviewUrl(alumni.photo || null);
    }
  }, [alumni]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const isValidEmail = (email?: string): boolean =>
    !!email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const isValidLinkedIn = (url: string) =>
    url.trim() === "" || /^https:\/\/(www\.)?linkedin\.com\/in\//.test(url);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsUploading(true)

    // Basic validation
    if (!isValidEmail(formData.email)) {
      toast.error("Error!", { description: "Invalid email address." });
      setIsUploading(false)
      return;
    }

    if (!isValidLinkedIn(formData.linkedin)) {
      toast.error("Error!", {
        description: "LinkedIn URL must start with https://linkedin.com/in/",
      });
        setIsUploading(false);
      return;
    }

    let uploadedStorageId = formData.storageId;

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
        uploadedStorageId = storageId;
      } catch (error) {
        console.error("Upload failed:", error);
        toast.error("Error!", {
          description: "Image upload failed. Try again.",
        });
        return;
      }
    }

    setIsUploading(false)

    onSubmit({
      ...formData,
      storageId: uploadedStorageId,
    });
  };

  if (!alumni) return null;

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
              <h2 className='text-2xl font-bold'>Update {alumni.name}</h2>
              <button
                onClick={() => onOpenChange(false)}
                className='p-2 hover:bg-gray-200 rounded-full transition'>
                <X className='w-5 h-5' />
              </button>
            </div>

            <form onSubmit={handleSubmit} className='space-y-4'>
              <div className='space-y-2 mt-4'>
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
                <label className='text-sm text-gray-500'>Email</label>
                <Input
                  type='email'
                  name='email'
                  value={formData.email}
                  onChange={handleChange}
                  placeholder='Email'
                  required
                />
              </div>

              <PhoneNumberInput
                value={formData.tel}
                onChange={(tel) => setFormData((prev) => ({ ...prev, tel }))}
              />

              <div className='space-y-2'>
                <label className='text-sm text-gray-500'>Degree</label>
                <Input
                  name='degree'
                  value={formData.degree}
                  onChange={handleChange}
                  placeholder='Degree'
                  required
                />
              </div>

              <div className='space-y-2'>
                <label className='text-sm text-gray-500'>
                  Current Position
                </label>
                <Input
                  name='currentPosition'
                  value={formData.currentPosition}
                  onChange={handleChange}
                  placeholder='Current Position'
                  required
                />
              </div>

              <div className='space-y-2'>
                <label className='text-sm text-gray-500'>Testimonial</label>
                <Textarea
                  name='testimonial'
                  value={formData.testimonial}
                  onChange={handleChange}
                  placeholder='Testimonial'
                  rows={3}
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
                  placeholder='https://linkedin.com/in/yourname'
                />
              </div>

              <div className='space-y-2'>
                <label className='text-sm text-gray-500'>Company</label>
                <Input
                  name='company'
                  value={formData.company}
                  onChange={handleChange}
                  placeholder='Company'
                />
              </div>

              <div className='space-y-2'>
                <label className='text-sm text-gray-500'>Graduation Year</label>
                <Input
                  name='graduatedOn'
                  value={formData.graduatedOn}
                  onChange={handleChange}
                  placeholder='Graduation Year'
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
                    disabled={isSubmitting}>
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
                      {/* <button
                        type='button'
                        onClick={() => {
                          setSelectedImage(null);
                          setPreviewUrl(alumni.photo || null);
                          if (imageInput.current) imageInput.current.value = "";
                        }}
                        className='text-red-500 hover:text-red-700 text-sm'>
                        Remove
                      </button> */}
                    </div>
                  )}
                </div>
              </div>

              <div className='flex items-center gap-4 pt-4'>
                <Button
                  variant='outline'
                  className='w-full'
                  onClick={() => onOpenChange(false)}
                  type='button'>
                  Cancel
                </Button>
                <Button
                  type='submit'
                  className='w-full'
                  disabled={isUploading}>
                  {isUploading ? "Updating..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
