// app/students/page.tsx
"use client";

import { StudentCardList } from "@/components/students/StudentCardList";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/convex/_generated/api";
import type { CourseType, FacultyType } from "@/convex/schema";
import { useQuery } from "convex/react";
import { useEffect, useState } from "react";

const faculties: FacultyType[] = [
  "Faculty of Arts",
  "Faculty of Education",
  "Faculty of Mgt. & Social Sciences",
  "Faculty of Nat. Science & Environmental Studies",
  "Faculty of Law",
];

const courseTypes: CourseType[] = ["pgd", "masters", "phd"];

export default function StudentsSection() {
  const [faculty, setFaculty] = useState<FacultyType | undefined>(undefined);
  const [type, setType] = useState<CourseType | undefined>(undefined);
  const [search, setSearch] = useState("");

  // Reset search when filters change
  useEffect(() => {
    setSearch("");
  }, [faculty, type]);

  const students = useQuery(api.students.getStudents, {
    faculty,
    type,
  });

  // Fetch statistics
  const stats = useQuery(api.students.getStatistics);

  const isLoading = students === undefined;
  const filteredStudents = (students ?? []).filter((student) =>
    student.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className='w-full bg-slate-50 dark:bg-slate-950'>
      <section className='space-y-8 p-6 max-w-5xl mx-auto'>
        <header className='space-y-2 text-center'>
          <h1 className='text-4xl font-bold tracking-tight'>
            Postgraduate Student Directory
          </h1>
          <p className='text-muted-foreground'>
            Explore and manage postgraduate student records across faculties and
            programs
          </p>
        </header>

        <div className='w-full bg-white dark:bg-slate-700 p-7 rounded-lg sm:max-w-xs flex flex-col justify-center items-center'>
          <h2 className='text-lg font-medium'>
            Total Number of students: {stats?.total}
          </h2>
          <div className='mt-4 flex gap-6'>
            <Badge>PGD: {stats?.pgd}</Badge>
            <Badge>Masters: {stats?.masters}</Badge>
            <Badge>PhD: {stats?.phd}</Badge>
          </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          {/* Faculty Select */}
          <Select
            value={faculty ?? ""}
            onValueChange={(value: string) =>
              setFaculty(value ? (value as FacultyType) : undefined)
            }>
            <SelectTrigger className='h-12 bg-muted/50 shadow-md'>
              <SelectValue placeholder='All Faculties' />
            </SelectTrigger>
            <SelectContent>
              {faculties.map((faculty) => (
                <SelectItem key={faculty} value={faculty}>
                  {faculty.replace("Faculty of ", "")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Program Type Select */}
          <Select
            value={type ?? ""}
            onValueChange={(value: string) =>
              setType(value ? (value as CourseType) : undefined)
            }>
            <SelectTrigger className='h-12 bg-muted/50 shadow-md'>
              <SelectValue placeholder='All Programs' />
            </SelectTrigger>
            <SelectContent>
              {courseTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Search Input */}
          <Input
            placeholder='Search by student name...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='h-12 bg-muted/50 shadow-md'
          />
        </div>

        {isLoading ? (
          <div className='text-center p-12 text-muted-foreground'>
            Loading student records...
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className='text-center p-12 text-muted-foreground'>
            No students found matching your criteria
          </div>
        ) : (
          <StudentCardList students={filteredStudents} />
        )}
      </section>
    </div>
  );
}
