"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { AnimatePresence, motion } from "framer-motion";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { PhoneNumberInput } from "../PhoneNumberInput";

interface AddAlumniModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AlumniFormData {
  name: string;
  email: string;
  degree: string;
  graduatedOn: string;
  currentPosition: string;
  testimonial: string;
  linkedin: string;
  company: string;
  // phone: string;
  tel: string;
  storageId: string;
}

export default function AddAlumniModal({
  isOpen,
  onClose,
}: AddAlumniModalProps) {
  const [formData, setFormData] = useState<AlumniFormData>({
    name: "",
    email: "",
    degree: "",
    graduatedOn: "",
    currentPosition: "",
    testimonial: "",
    linkedin: "",
    company: "",
    // phone: "",
    tel: "",
    storageId: "",
  });

  const addAlumni = useMutation(api.alumni.addAlumni);
  const generateUploadUrl = useMutation(api.staff.generateUploadUrl);

  const MAX_SIZE_MB = 1;

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    document.body.classList.toggle("overflow-hidden", isOpen);
    return () => document.body.classList.remove("overflow-hidden");
  }, [isOpen]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error("Error!", {
        description: "File size must be less than 1MB.",
      });
      setSelectedImage(null);
      return;
    }

    const optimizedFile = await optimizeImage(file);

    setSelectedImage(optimizedFile);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validation
    if (!formData.tel || !/^\+\d{10,15}$/.test(formData.tel)) {
      toast.error("Invalid Phone Number", {
        description: "Enter a valid phone number.",
      });
      setLoading(false);
      return;
    }

    // const parsedPhone = Number(formData.phone);

    if (formData.name.trim().length < 5) {
      toast.error("Name Too Short", {
        description: "Name must be at least 5 characters long.",
      });
      setLoading(false);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error("Error!", { description: "Invalid email address" });
      setLoading(false);
      return;
    }

    if (formData.testimonial.length < 20 || formData.testimonial.length > 250) {
      toast.error("Testimonial Length Error", {
        description: "Testimonial must be between 20 and 250 characters.",
      });
      setLoading(false);
      return;
    }

    if (
      !/^https:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-_.]+$/.test(
        formData.linkedin
      )
    ) {
      toast.error("Invalid LinkedIn URL", {
        description:
          "Provide a valid LinkedIn URL starting with https://linkedin.com/in/",
      });
      setLoading(false);
      return;
    }

    try {
      let storageId = "";

      // Upload image first
      if (selectedImage) {
        try {
          const uploadUrl = await generateUploadUrl();
          const res = await fetch(uploadUrl, {
            method: "POST",
            headers: { "Content-Type": selectedImage.type },
            body: selectedImage,
          });

          if (!res.ok) throw new Error("Upload failed");

          const result = await res.json();
          storageId = result.storageId;
        } catch (error) {
          toast.error("Image Upload Failed", {
            description: "Could not upload image. Please try again.",
          });
          console.error(error);
          setLoading(false);
          return;
        }
      }

      // Add to database after image is uploaded
      await addAlumni({
        ...formData,
        storageId, // ✅ now populated!
      });

      toast.success("Done!", { description: "Alumnus Added" });

      onClose();
      setFormData({
        name: "",
        email: "",
        degree: "",
        graduatedOn: "",
        currentPosition: "",
        testimonial: "",
        linkedin: "",
        company: "",
        // phone: "",
        tel: "",
        storageId: "",
      });
      setSelectedImage(null);
    } catch (error) {
      console.error("Error submitting:", error);
      toast.error("Submission Error", {
        description: "Failed to submit alumnus data. Try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-2 sm:px-4 overflow-x-hidden'
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        onClick={onClose}>
        <motion.div
          className='relative bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-xl shadow-lg w-full max-w-lg sm:max-w-xl lg:max-w-2xl max-h-[calc(100vh-4rem)] overflow-y-auto overflow-x-hidden my-8'
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={(e) => e.stopPropagation()}>
          <h2 className='text-xl font-bold mb-4'>Add Alumni</h2>
          <form className='space-y-4 break-words' onSubmit={handleSubmit}>
            <InputField
              label='Full Name'
              name='name'
              value={formData.name}
              onChange={handleChange}
              required
            />

            <InputField
              label='Email'
              type='email'
              name='email'
              value={formData.email}
              onChange={handleChange}
              required
            />

            <div className='space-y-0.5'>
              <PhoneNumberInput
                value={formData.tel}
                onChange={(tel) => setFormData((prev) => ({ ...prev, tel }))}
              />
            </div>

            <InputField
              label='Degree'
              name='degree'
              value={formData.degree}
              onChange={handleChange}
              required
            />

            <InputField
              label='Graduation Year'
              name='graduatedOn'
              value={formData.graduatedOn}
              onChange={handleChange}
              required
            />
            <InputField
              label='Current Company'
              name='company'
              value={formData.company}
              onChange={handleChange}
              required
            />
            <InputField
              label='Current Position'
              name='currentPosition'
              value={formData.currentPosition}
              onChange={handleChange}
              required
            />
            <TextareaField
              label='Testimonial (min. of 20, max. of 250 char)'
              name='testimonial'
              length={formData.testimonial.length}
              value={formData.testimonial}
              onChange={handleChange}
              required
            />
            <InputField
              label='LinkedIn Profile'
              name='linkedin'
              value={formData.linkedin}
              onChange={handleChange}
              required
            />

            <div className='space-y-0.5'>
              <label htmlFor='photo' className='text-sm text-gray-500'>
                Photo
              </label>
              <Input
                type='file'
                accept='image/*'
                onChange={handleFileUpload}
                className='cursor-pointer'
              />
            </div>

            <div className='mt-6 pt-2 flex items-center gap-2'>
              <Button
                type='button'
                variant='outline'
                onClick={onClose}
                disabled={loading}
                className='w-full'>
                Cancel
              </Button>
              <Button type='submit' disabled={loading} className='w-full'>
                {loading ? "Submitting..." : "Submit"}
              </Button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function InputField({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className='space-y-0.5'>
      <label htmlFor={props.name} className='text-sm text-gray-500'>
        {label}
      </label>
      <Input {...props} />
    </div>
  );
}

function TextareaField({
  label,
  length,
  ...props
}: {
  label: string;
  length: number;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div className='space-y-0.5'>
      <label htmlFor={props.name} className='text-sm text-gray-500'>
        {label}
      </label>
      <Textarea {...props} />
      <p className='text-sm text-muted-foreground'>
        {length} {length < 2 ? "character" : "characters"}
      </p>
    </div>
  );
}
