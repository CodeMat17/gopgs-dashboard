"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import { BookOpen, Clock } from "lucide-react";
import { useState } from "react";
import { DeleteCourse } from "./DeleteCourse";
import UpdateCourse from "./UpdateCourse";

const faculties = [
  "Faculty of Arts",
  "Faculty of Education",
  "Faculty of Mgt. & Social Sciences",
  "Faculty of Nat. Science & Environmental Studies",
  "Faculty of Law",
] as const;

const courseLevels = ["pgd", "masters", "phd"] as const;

const levelHeaders: Record<(typeof courseLevels)[number], string> = {
  pgd: "PGD Courses",
  masters: "Masters Courses",
  phd: "PhD Courses",
};

const levelColors: Record<(typeof courseLevels)[number], string> = {
  pgd: "text-amber-600",
  masters: "text-blue-600",
  phd: "text-purple-600",
};

export default function FacultyCourseBrowser() {
  const [selectedFaculty, setSelectedFaculty] = useState<
    (typeof faculties)[number] | ""
  >(faculties[0]);

  const courses = useQuery(
    api.courses.getCoursesByFaculty,
    selectedFaculty ? { faculty: selectedFaculty } : "skip"
  );

  const groupByType = (type: string) =>
    courses?.filter((course) => course.type === type) ?? [];

  const allEmpty =
    courses?.length === 0 ||
    (groupByType("pgd").length === 0 &&
      groupByType("masters").length === 0 &&
      groupByType("phd").length === 0);

  return (
    <div>
      <div className='mb-10'>
        <label
          htmlFor='faculty'
          className='block mb-2 text-sm font-semibold text-muted-foreground'>
          Select Faculty
        </label>
        <Select
          value={selectedFaculty}
          onValueChange={(val) =>
            setSelectedFaculty(val as (typeof faculties)[number])
          }>
          <SelectTrigger className='w-full sm:max-w-md rounded-lg py-6 bg-white dark:bg-gray-800'>
            <SelectValue placeholder='Select faculty' />
          </SelectTrigger>
          <SelectContent>
            {faculties.map((faculty) => (
              <SelectItem key={faculty} value={faculty}>
                {faculty}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!courses ? (
        <div className='grid md:grid-cols-3 gap-6'>
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className='h-48 w-full rounded-xl' />
          ))}
        </div>
      ) : allEmpty ? (
        <p className='text-center text-muted-foreground mt-16'>
          No courses available under the selected faculty.
        </p>
      ) : (
        <motion.div
          className='grid xl:grid-cols-3 gap-4 xl:gap-3'
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}>
          {courseLevels.map((level) => {
            const levelCourses = groupByType(level);
            const levelColor = levelColors[level];

            return (
              <Card
                key={level}
                className='rounded-2xl border shadow-sm transition hover:shadow-md duration-200 flex flex-col dark:bg-gray-900'>
                <CardHeader>
                  <CardTitle className={`text-2xl font-bold ${levelColor}`}>
                    {levelHeaders[level]}{" "}
                    <span className='text-muted-foreground font-medium text-sm'>
                      ({levelCourses.length} course
                      {levelCourses.length === 1 ? "" : "s"})
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-6 flex-1'>
                  {levelCourses.length === 0 ? (
                    <p className='text-sm text-muted-foreground'>
                      No {level} courses available.
                    </p>
                  ) : (
                    levelCourses.map((course) => (
                      <motion.div
                        key={course._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className='space-y-2 border-b last:border-b-0 pb-4 last:pb-0'>
                        <div className='space-y-2'>
                          <h4 className='font-medium text-base'>
                            {course.course}
                          </h4>
                          <p className='text-sm text-muted-foreground flex items-center'>
                            <span className='flex items-center'>
                              <Clock className='w-4 h-4 mr-1 text-amber-500' />
                              {course.duration}
                            </span>
                         
                          </p>
                          <p className='text-sm text-muted-foreground flex items-center'>
                           
                            <span className='flex items-center'>
                              <BookOpen className='w-4 h-4 mr-1 text-amber-500' />
                              {course.mode}
                            </span>
                          </p>
                        </div>
                        {/* <Link href={`/courses/${course.slug}`} passHref>
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className='inline-block'>
                            <Button
                              size='sm'
                              variant='outline'
                              className='mt-3'>
                              Learn More
                            </Button>
                          </motion.div>
                        </Link> */}
                        <div className='mt-auto pt-6 flex gap-2 lg:gap-4'>
                          <DeleteCourse
                            id={course._id}
                            course={course.course}
                          />
                          <UpdateCourse
                            c_id={course._id}
                            c_course={course.course}
                            c_duration={course.duration}
                            c_mode={course.mode}
                            c_overview={course.overview}
                            c_whyChoose={course.whyChoose}
                            c_faculty={course.faculty}
                            c_type={course.type}
                          />
                        </div>
                      </motion.div>
                    ))
                  )}
                </CardContent>
              </Card>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
