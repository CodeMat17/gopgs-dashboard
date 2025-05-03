"use client";

import AddCourse from "@/components/courses/AddCourse";
import CourseBrowser from "@/components/courses/CourseBrowser";


export default function ProgramsPage() {
  return (
    <div className='w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
      <div className='mb-16 flex justify-between'>
        <h1 className='text-3xl sm:text-4xl font-bold'>Our Courses</h1>
        <AddCourse />
      </div>

     
<CourseBrowser />
    
    </div>
  );
}
