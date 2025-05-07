"use client";

import { Card } from "@/components/ui/card";
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
import { BookOpen, Clock, X } from "lucide-react";
import { useState } from "react";
import { DeleteCourse } from "./DeleteCourse";
import UpdateCourse from "./UpdateCourse";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";

type Faculty = (typeof faculties)[number];
type CourseLevel = "all" | "pgd" | "masters" | "phd";
const courseLevels: CourseLevel[] = ["all", "pgd", "masters", "phd"];

const faculties = [
  "Faculty of Arts",
  "Faculty of Education",
  "Faculty of Mgt. & Social Sciences",
  "Faculty of Nat. Science & Environmental Studies",
  "Faculty of Law",
] as const;

// Add type guard validation
const isValidCourseLevel = (value: string): value is CourseLevel => {
  return courseLevels.includes(value as CourseLevel);
};


const levelConfig = {
  all: "All Programs",
  pgd: "PGD",
  masters: "Masters",
  phd: "PhD",
} as const;

export default function CourseBrowser() {
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | "all">(
    "all"
  );
  const [selectedProgram, setSelectedProgram] = useState<CourseLevel>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const allCourses = useQuery(api.courses.getAllCourses);
  const isLoading = allCourses === undefined;

  // Client-side filtering
  const filteredCourses =
    allCourses?.filter((course) => {
      const matchesFaculty =
        selectedFaculty === "all" || course.faculty === selectedFaculty;
      const matchesProgram =
        selectedProgram === "all" || course.type === selectedProgram;
      const matchesSearch = course.course
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      return matchesFaculty && matchesProgram && matchesSearch;
    }) ?? [];


  // Clear all filters
  const clearFilters = () => {
    setSelectedFaculty("all");
    setSelectedProgram("all");
    setSearchQuery("");
  };

  return (
    <div className='space-y-8'>
      <div className='w-full max-w-2xl flex flex-col md:flex-row items-center justify-between gap-3'>
        <div className='w-full'>
          <label className='block mb-2 text-sm font-semibold text-muted-foreground'>
            Select Faculty
          </label>
          <Select
            value={selectedFaculty}
            onValueChange={(value: Faculty | "all") =>
              setSelectedFaculty(value)
            }>
            <SelectTrigger className='w-full h-10 bg-white dark:bg-gray-700'>
              <SelectValue placeholder='Select faculty' />
            </SelectTrigger>
            <SelectContent className='dark:bg-gray-700'>
              <SelectItem value='all'>All Faculties</SelectItem>
              {faculties.map((faculty) => (
                <SelectItem key={faculty} value={faculty} className='py-2'>
                  {faculty.replace("Faculty of ", "")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className='w-full'>
          <label className='block mb-2 text-sm font-semibold text-muted-foreground'>
            Program Type
          </label>
          <Select
            value={selectedProgram}
            onValueChange={(value: string) => {
              if (isValidCourseLevel(value)) {
                setSelectedProgram(value);
              }
            }}>
            <SelectTrigger className='w-full h-10 bg-white dark:bg-gray-700'>
              <SelectValue placeholder='Select program' />
            </SelectTrigger>
            <SelectContent className='dark:bg-gray-700'>
              {courseLevels.map((level) => (
                <SelectItem key={level} value={level} className='py-2'>
                  {levelConfig[level]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className='space-y-2 w-full'>
          <label className='block text-sm font-medium'>Search Courses</label>
          <div className='relative'>
            <Input
              type='text'
              placeholder='Search course titles...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='w-full h-10 bg-white dark:bg-gray-700'
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'>
                <X className='h-4 w-4' />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Active Filters */}
      {(selectedFaculty !== "all" ||
        selectedProgram !== "all" ||
        searchQuery) && (
        <div className='flex items-center gap-3 flex-wrap'>
          <span className='text-sm text-muted-foreground'>Active filters:</span>
          {selectedFaculty !== "all" && (
            <Badge variant='outline' className='gap-2'>
              {selectedFaculty.replace("Faculty of ", "")}
              <button onClick={() => setSelectedFaculty("all")}>
                <X className='h-3 w-3' />
              </button>
            </Badge>
          )}
          {selectedProgram !== "all" && (
            <Badge variant='outline' className='gap-2'>
              {levelConfig[selectedProgram]}
              <button onClick={() => setSelectedProgram("all")}>
                <X className='h-3 w-3' />
              </button>
            </Badge>
          )}
          {searchQuery && (
            <Badge variant='outline' className='gap-2'>
              {searchQuery}
              <button onClick={() => setSearchQuery("")}>
                <X className='h-3 w-3' />
              </button>
            </Badge>
          )}
          <Button
            variant='ghost'
            size='sm'
            onClick={clearFilters}
            className='text-primary hover:bg-accent'>
            Clear all
          </Button>
        </div>
      )}

      {/* Course Grid */}
      {isLoading ? (
        <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className='h-48 w-full rounded-xl' />
          ))}
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className='text-center py-12 text-muted-foreground'>
          No courses found matching your criteria
        </div>
      ) : (
        <motion.div
          className='space-y-6'
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}>
          <h2 className='text-2xl font-bold'>{levelConfig[selectedProgram]}</h2>

          <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {" "}
            {filteredCourses.map((course) => (
              <motion.div
                key={course._id}
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}>
                <Card className='p-4 hover:shadow-lg transition-shadow'>
                  <div className='space-y-3'>
                    <h3 className='font-medium text-lg'>{course.course}</h3>
                    <div className='space-y-2 text-muted-foreground'>
                      <div className='flex items-center gap-2'>
                        <Clock className='w-4 h-4 text-amber-500' />
                        <span>{course.duration}</span>
                      </div>
                      <div className='flex items-center gap-2'>
                        <BookOpen className='w-4 h-4 text-blue-500' />
                        <span>{course.mode}</span>
                      </div>
                    </div>
                    <div className='pt-3 flex items-center justify-between gap-3'>
                      <DeleteCourse id={course._id} course={course.course} />
                      <UpdateCourse
                        id={course._id}
                        c_course={course.course}
                        c_faculty={course.faculty}
                        c_mode={course.mode}
                        c_duration={course.duration}
                        c_type={course.type}
                        c_overview={course.overview}
                        c_whyChoose={course.whyChoose}
                      />
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
