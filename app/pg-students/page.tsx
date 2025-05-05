// app/students/PGStudents.tsx
"use client";

import AddStudents from "@/components/students/AddStudents";
import { StudentCardList } from "@/components/students/StudentCardList";
import { Button } from "@/components/ui/button";
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
import { useState } from "react";

const FACULTIES = [
  "Faculty of Arts",
  "Faculty of Education",
  "Faculty of Mgt. & Social Sciences",
  "Faculty of Nat. Science & Environmental Studies",
  "Faculty of Law",
] as const;

const PROGRAM_TYPES = ["pgd", "masters", "phd"] as const;

export default function PGStudents() {
  const [selectedFaculty, setSelectedFaculty] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("");

  const students = useQuery(api.students.getStudents, {
    filters:
      selectedFaculty && selectedType
        ? {
            faculty: selectedFaculty as (typeof FACULTIES)[number],
            type: selectedType as (typeof PROGRAM_TYPES)[number],
          }
        : "skip",
  });

  const hasFilters = selectedFaculty || selectedType;

  return (
    <div className='min-h-screen px-4 pt-8 pb-12 bg-gray-50 dark:bg-slate-950'>
      <div className='max-w-5xl mx-auto space-y-8'>
        <div className='flex justify-between mb-8'>
          <div className='space-y-3'>
            <h1 className='text-3xl font-bold'>
              Postgraduate Students
              {hasFilters && (
                <span className='text-sm ml-2 text-muted-foreground'>
                  (Filtered)
                </span>
              )}
            </h1>

            <Button
              onClick={() => {
                setSelectedFaculty("");
                setSelectedType("");
              }}
              variant='outline'
              size='sm'
              disabled={!hasFilters}>
              Clear Filters
            </Button>
          </div>
          <AddStudents />
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-8'>
          <div className='space-y-1'>
            <label className='block text-sm font-medium text-slate-600'>
              Faculty
            </label>
            <Select value={selectedFaculty} onValueChange={setSelectedFaculty}>
              <SelectTrigger className='h-12 rounded-lg bg-white shadow-md dark:bg-gray-700'>
                <SelectValue placeholder='All Faculties' />
              </SelectTrigger>
              <SelectContent className='bg-gray-200 dark:bg-gray-700'>
                {FACULTIES.map((faculty) => (
                  <SelectItem
                    key={faculty}
                    value={faculty}
                    className='text-base hover:bg-slate-50'>
                    {faculty.replace("Faculty of ", "")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-1'>
            <label className='block text-sm font-medium text-slate-600'>
              Program Type
            </label>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className='h-12 rounded-lg bg-white shadow-md dark:bg-gray-700'>
                <SelectValue placeholder='All Programs' />
              </SelectTrigger>
              <SelectContent className='bg-gray-200 dark:bg-gray-700'>
                {PROGRAM_TYPES.map((type) => (
                  <SelectItem
                    key={type}
                    value={type}
                    className='text-base hover:bg-slate-50'>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {students === undefined ? (
          <SkeletonGrid />
        ) : (
          <StudentCardList students={students}  />
        )}
      </div>
    </div>
  );
}

const SkeletonGrid = () => (
  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
    {[...Array(6)].map((_, i) => (
      <Skeleton key={i} className='h-48 rounded-xl' />
    ))}
  </div>
);
