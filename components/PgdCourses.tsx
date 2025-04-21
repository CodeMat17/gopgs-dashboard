"use client";

import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { Minus } from "lucide-react";
import CourseCard from "./CourseCard";
import AddPgdCourse from "./courses/AddPgdCourse";

const PgdCourses = () => {
  const pgdCourses = useQuery(api.courses.getCoursesByType, { type: "pgd" });

  return (
    <div>
      <div className="mb-8 flex items-center justify-between gap-2 sm:gap-4">
        <h1 className='text-2xl font-medium'>Our PGD Courses</h1>
        <AddPgdCourse />
      </div>
     
      {pgdCourses === undefined ? (
        <div className='flex items-center p-8 text-muted-foreground'>
          <Minus className='animate-spin mr-3' /> PGD courses loading...
        </div>
      ) : pgdCourses.length < 1 ? (
        <div className='p-8 text-muted-foreground'>
          No PGD Courses available at the moment.
        </div>
      ) : (
        <div className='mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
          {pgdCourses.map((pgd) => (
            <CourseCard
              key={pgd._id}
              id={pgd._id}
              course={pgd.course}
              duration={pgd.duration}
              mode={pgd.mode}
              overview={pgd.overview}
              whyChoose={pgd.whyChoose}
              faculty={pgd.faculty ?? ''}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PgdCourses;
