"use client";

import { RichTextEditor } from "@/components/RichTextEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { Eye, EyeOff, Minus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const HowToApply = () => {
  const howData = useQuery(api.howToApply.getAll);
  const update = useMutation(api.howToApply.updateHowToApply);

  const [text, setText] = useState("");
  const [link, setLink] = useState("");

  const [isUploading, setIsUploading] = useState(false);
  const [lock, setLock] = useState(true);

  useEffect(() => {
    if (howData && howData.length > 0) {
      setText(howData[0].text);
      setLink(howData[0].link);
    }
  }, [howData]);

  const handleLock = () => {
    setLock((prev) => !prev);
  };

  const handleUpdate = async () => {
    if (!howData || howData.length === 0) {
      toast.error("Error!", { description: "No data to update" });
      return;
    }

    setIsUploading(true);
    try {
      await update({ id: howData[0]._id, text, link });
      toast.success("Done!", { description: "Updated successfully" });
    } catch (error) {
      toast.error("Error!", {
        description:
          error instanceof Error ? error.message : "Failed to update",
      });
    } finally {
      setIsUploading(false);
    }
  };

  if (howData === undefined) {
    return (
      <div className='px-4 w-full max-w-4xl mx-auto py-12 flex items-center'>
        <Minus className='animate-spin mr-3' /> Loading...
      </div>
    );
  }

  return (
    <div className='px-4 w-full max-w-4xl mx-auto py-12'>
      <h1 className='text-3xl sm:text-4xl font-bold mb-6'>How to apply</h1>
      <div className='space-y-4'>
        <div className='space-y-1'>
          <label className='text-sm text-muted-foreground'>How to apply</label>
          <RichTextEditor value={text} onChange={(e) => setText(e)} />
        </div>
        <div className='relative space-y-1'>
          <label className='text-sm text-muted-foreground'>Link</label>
          <Input
            disabled={lock}
            placeholder='Enter the apply link'
            value={link}
            onChange={(e) => setLink(e.target.value)}
          />

          <Button
            size='icon'
            variant='ghost'
            onClick={handleLock}
            className='absolute top-6 right-0'>
            {lock ? (
              <EyeOff className='w-6 h-6' />
            ) : (
              <Eye className='w-6 h-6' />
            )}
          </Button>
        </div>
        <div className='pt-6 flex justify-end'>
          <Button
            className='px-12'
            onClick={handleUpdate}
            disabled={isUploading}>
            {isUploading ? "Updating..." : "Update"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HowToApply;
