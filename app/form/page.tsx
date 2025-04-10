"use client";

import { RichTextEditor } from "@/components/RichTextEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import Image from "next/image";
import { FormEvent, useRef, useState } from "react";

const FormPage = () => {
  const generateUploadUrl = useMutation(api.staff.generateUploadUrl);
  const sendStaffData = useMutation(api.staff.createStaff);

  const imageInput = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const MAX_SIZE_MB = 1;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [profile, setProfile] = useState("");

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

    setError(null); // Clear any previous errors

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

  const handleSendData = async (e: FormEvent) => {
    e.preventDefault();

    // Step 1: Get a short-lived upload URL
    const postUrl = await generateUploadUrl();

    // Step 2: POST the file to the URL
    const result = await fetch(postUrl, {
      method: "POST",
      headers: {
        "Content-Type": selectedImage!.type,
      },
      body: selectedImage,
    });

    const { storageId } = await result.json();

    // Step 3: Save the newly allocated storage id, name, and email to the database
    await sendStaffData({ storageId, name, email, role });

    // Clear the selected image and reset the input
    setSelectedImage(null);
    imageInput.current!.value = "";
    setName("");
    setRole("");
    setEmail("");
    setLinkedin("");
    setProfile("");
  };

  return (
    <div className='px-4 py-12'>
      <form onSubmit={handleSendData} className='space-y-3'>
        <div className='space-y-1'>
          <label htmlFor='name' className='text-sm text-muted-foreground'>
            Name
          </label>
          <Input
            type='text'
            placeholder='Eg: Jane Deo'
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className='space-y-1'>
          <label htmlFor='role' className='text-sm text-muted-foreground'>
            Role
          </label>
          <Input
            type='text'
            placeholder='Eg: Associate Professor of Management'
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
          />
        </div>

        <div className='flex flex-col sm:flex-row gap-3'>
          <div className='space-y-1 w-full'>
            <label htmlFor='email' className='text-sm text-muted-foreground'>
              Email
            </label>
            <Input
              type='email'
              placeholder='Eg: janedeo@gmail.com'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className='space-y-1 w-full'>
            <label htmlFor='linkedin' className='text-sm text-muted-foreground'>
              LinkedIn (optional)
            </label>
            <Input
              type='text'
              placeholder='Eg: https://linkedin.com/in/janedeo'
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
              required
            />
          </div>
        </div>

        <div className='space-y-1'>
          <label htmlFor='profile' className='text-sm text-muted-foreground'>
            Profile
          </label>
          <RichTextEditor value={profile} onChange={setProfile} />
        </div>

        <div className='space-y-2'>
          <label className='text-sm text-muted-foreground'>Photo</label>

          <div className='flex flex-col items-center gap-3 p-4 border rounded-lg shadow-md'>
            <label className='text-sm font-medium text-gray-700'>
              Upload Image
            </label>

            {/* Hidden File Input */}
            <input
              type='file'
              accept='image/*'
              ref={imageInput}
              onChange={handleFileChange}
              className='hidden'
            />

            {/* Custom Upload Button */}
            <button
              type='button'
              onClick={() => imageInput.current?.click()}
              className='px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition'
              disabled={selectedImage !== null}>
              {selectedImage ? "Image Selected" : "Select Image"}
            </button>

            {/* Error Message */}
            {error && <p className='text-red-500 text-sm'>{error}</p>}

            {/* Preview & Remove */}
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
                    if (imageInput.current) imageInput.current.value = "";
                  }}
                  className='text-red-500 hover:text-red-700 text-sm'>
                  Remove
                </button>
              </div>
            )}
          </div>
        </div>

        <div className='pt-4'>
          <Button
            type='submit'
            disabled={
              selectedImage === null ||
              !name.trim() ||
              !role.trim() ||
              !email.trim() ||
              !profile.trim()
            }
            className='w-full'>
            Submit
          </Button>
        </div>
      </form>
    </div>
  );
};

export default FormPage;
