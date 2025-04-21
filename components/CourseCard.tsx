"use client";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { BookOpen, Calendar, Minus, Monitor, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import UpdateCourse from "./courses/UpdateCourse";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

type CourseProps = {
  id: Id<"courses">;
  course: string;
  duration: string;
  mode: string;
  overview: string;
  faculty?: string;
  whyChoose: { title: string; description: string }[];
};

const CourseCard = ({
  id,
  course,
  duration,
  mode,
  overview,
  whyChoose,
  faculty,
}: CourseProps) => {
  const [deleting, setDeleting] = useState(false);

  const deleteCourse = useMutation(api.courses.deleteCourse);

  const handleDelete = async () => {
    setDeleting(true); // Set loading state
    try {
      await deleteCourse({ id });
      toast.success("Course deleted successfully!");
    } catch (error) {
      console.error("Failed to delete course:", error);
      toast.error("Failed to delete course.");
    } finally {
      setDeleting(false); // Reset loading state
    }
  };

  return (
    <Card className='p-6 bg-background dark:bg-neutral-900/30 dark:border-neutral-700 flex flex-col'>
      <div className='space-y-4'>
        <div>
          <h3 className='text-muted-foreground'>{faculty}</h3>
          <h2 className='text-xl font-medium'>{course}</h2>
        </div>

        <div className='space-y-0.5'>
          <div className='flex items-center gap-2 text-sm'>
            <Calendar className='w-4 h-4 text-amber-500' /> {duration} Months
          </div>
          {mode === "On-line" && (
            <div className='flex items-center gap-2 text-sm'>
              <Monitor className='w-4 h-4 text-amber-500' /> On-line
            </div>
          )}
          {mode === "On-campus" && (
            <div className='flex items-center gap-2 text-sm'>
              <BookOpen className='w-4 h-4 text-amber-500' /> On-campus
            </div>
          )}
          {mode === "On-line & On-campus" && (
            <div className='flex items-center gap-2 text-sm'>
              <Users className='w-4 h-4 text-amber-500' /> On-line & On-campus
            </div>
          )}
        </div>
      </div>
      <div className='mt-auto pt-6 flex gap-2 lg:gap-4'>
        <Button
          onClick={handleDelete}
          disabled={deleting}
          className='w-full text-white bg-red-500 hover:bg-red-700'>
          {deleting ? <Minus className='animate-spin' /> : "Delete"}
        </Button>

        <UpdateCourse
          c_id={id}
          c_course={course}
          c_duration={duration}
          c_mode={mode}
          c_overview={overview}
          c_whyChoose={whyChoose}
          c_faculty={faculty ?? ''}
        />
      </div>
    </Card>
  );
};

export default CourseCard;
