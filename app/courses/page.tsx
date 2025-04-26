"use client";

import AddCourse from "@/components/courses/AddCourse";
import FacultyCourseBrowser from "@/components/courses/FacultyCourseBrower";


export default function ProgramsPage() {
  return (
    <div className='w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
      <div className='mb-16 flex justify-between'>
        <h1 className='text-3xl sm:text-4xl font-bold'>Our Courses</h1>
        <AddCourse />
      </div>

      <FacultyCourseBrowser />

      {/* <div className='w-full py-12'>
        <Tabs defaultValue='pgd'>
          <TabsList className='flex flex-col sm:flex-row gap-3 w-full'>
            <TabsTrigger
              value='pgd'
              className='w-full sm:w-auto justify-start px-6 py-3 sm:py-2 rounded-lg
          border border-input bg-gray-100 dark:bg-gray-800 hover:bg-accent hover:text-accent-foreground
          data-[state=active]:bg-primary data-[state=active]:text-primary-foreground
          data-[state=active]:border-primary data-[state=active]:shadow-md
          transition-all duration-200 font-medium
          dark:border-neutral-700 dark:hover:bg-neutral-800/50
          dark:data-[state=active]:bg-primary/80 dark:data-[state=active]:border-primary-600
          dark:data-[state=active]:shadow-primary/10'>
              PGD Courses
            </TabsTrigger>

            <TabsTrigger
              value='masters'
              className='w-full sm:w-auto justify-start px-6 py-3 sm:py-2 rounded-lg
          border border-input bg-gray-100 dark:bg-gray-800 hover:bg-accent hover:text-accent-foreground
          data-[state=active]:bg-primary data-[state=active]:text-primary-foreground
          data-[state=active]:border-primary data-[state=active]:shadow-md
          transition-all duration-200 font-medium
          dark:border-neutral-700 dark:hover:bg-neutral-800/50
          dark:data-[state=active]:bg-primary/80 dark:data-[state=active]:border-primary-600
          dark:data-[state=active]:shadow-primary/10'>
              Masters Courses
            </TabsTrigger>

            <TabsTrigger
              value='phd'
              className='w-full sm:w-auto justify-start px-6 py-3 sm:py-2 rounded-lg
          border border-input bg-gray-100 dark:bg-gray-800 hover:bg-accent hover:text-accent-foreground
          data-[state=active]:bg-primary data-[state=active]:text-primary-foreground
          data-[state=active]:border-primary data-[state=active]:shadow-md
          transition-all duration-200 font-medium
          dark:border-neutral-700 dark:hover:bg-neutral-800/50
          dark:data-[state=active]:bg-primary/80 dark:data-[state=active]:border-primary-600
          dark:data-[state=active]:shadow-primary/10'>
              PhD Courses
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value='pgd'
            className='pt-8 mt-16 sm:mt-0 focus:outline-none'>
            <div className='text-foreground dark:text-neutral-200'>
              <PgdCourses />
            </div>
          </TabsContent>

          <TabsContent
            value='masters'
            className='pt-8 mt-16 sm:mt-0 focus:outline-none'>
            <div className='text-foreground dark:text-neutral-200'>
              <MastersCourses />
            </div>
          </TabsContent>

          <TabsContent
            value='phd'
            className='pt-8 mt-16 sm:mt-0 focus:outline-none'>
            <div className='text-foreground dark:text-neutral-200'>
              <PhdCourses />
            </div>
          </TabsContent>
        </Tabs>
      </div> */}
    </div>
  );
}
