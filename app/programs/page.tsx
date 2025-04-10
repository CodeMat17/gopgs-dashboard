"use client";

// import { SafeHTMLRenderer } from "@/components/SafeHTMLRenderer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import {
  BookOpen,
  Calendar,
  CalendarX2Icon,
  MinusIcon,
  Monitor,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";

export default function ProgramsPage() {
  const fetchedPrograms = useQuery(api.programs.getFewProgramsData);
  const removeProgram = useMutation(api.programs.removeProgram);

  const [programs, setPrograms] = useState(fetchedPrograms ?? []);
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingProgramId, setDeletingProgramId] =
    useState<Id<"programs"> | null>(null);

  useEffect(() => {
    if (fetchedPrograms !== undefined) {
      setPrograms(fetchedPrograms); // Only update state when data arrives
    }
  }, [fetchedPrograms]);

  const handleDeleteProgram = async (id: Id<"programs">) => {
    setDeletingProgramId(id); // Set loading state
    try {
      await removeProgram({ _id: id });
      setPrograms((prev) => prev.filter((program) => program._id !== id)); // Update UI
      toast.success("Program deleted successfully!");
    } catch (error) {
      console.error("Failed to delete program:", error);
      toast.error("Failed to delete program.");
    } finally {
      setDeletingProgramId(null); // Reset loading state
    }
  };

  if (fetchedPrograms === undefined) {
    return (
      <div className='w-full min-h-96 flex items-center justify-center'>
        <MinusIcon className='animate-spin mr-3' /> Loading programs
      </div>
    );
  }

  const filteredPrograms = programs
    ? programs.filter((program) =>
        program?.programShortName
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase())
      )
    : [];

  return (
    <div className='w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-3xl sm:text-4xl font-bold'>Our Programs</h1>
        <Button asChild>
          <Link href='/programs/add'>Add Program</Link>
        </Button>
      </div>
      <p className='text-lg text-muted-foreground mb-8'>
        Explore our diverse range of academic programs. Use the search below to
        find a specific program.
      </p>

      {/* Search Bar */}
      <div className='mb-6'>
        <Input
          type='text'
          placeholder='Search for a program...'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className='border-amber-500 bg-amber-50 dark:bg-amber-500/10 py-5'
        />
        <p className='text-sm text-muted-foreground mt-2 text-amber-700 dark:text-amber-500'>
          Start typing to find a specific program.
        </p>
      </div>

      {/* Programs List */}
      <div className='grid sm:grid-cols-2 lg:grid-cols-3 gap-4'>
        {filteredPrograms.length > 0 ? (
          filteredPrograms.map((program) => (
            <Card
              key={program._id}
              className={`p-4 hover:shadow-lg transition-shadow ${
                program.status
                  ? "bg-white dark:bg-gray-800"
                  : "bg-red-800/10 dark:bg-red-800/20"
              } flex flex-col justify-between h-full`}>
              <div>
                <h3 className='text-lg font-semibold mb-2'>
                  {program.programShortName}
                </h3>
                <div className='flex flex-col gap-2 text-sm text-muted-foreground'>
                  <div className='flex items-center gap-2'>
                    <Calendar className='w-4 h-4 text-amber-500' />
                    <span>{program.studyDuration}</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    {program.deliveryMode === "Online" && (
                      <Monitor className='w-4 h-4 text-amber-500' />
                    )}
                    {program.deliveryMode === "On-Campus" && (
                      <BookOpen className='w-4 h-4 text-amber-500' />
                    )}
                    {program.deliveryMode === "Online & On-Campus" && (
                      <Users className='w-4 h-4 text-amber-500' />
                    )}
                    <span>{program.deliveryMode}</span>
                  </div>
                  {!program.status && (
                    <div className='flex items-center gap-2'>
                      <CalendarX2Icon className='w-4 h-4 text-red-500' />
                      <span>Admission Closed</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Button Container - Always at bottom */}
              <div className='mt-4 flex items-end gap-6 justify-between'>
                <Button
                  variant='destructive'
                  onClick={() => handleDeleteProgram(program._id)}
                  disabled={deletingProgramId === program._id}>
                  {deletingProgramId === program._id ? "Deleting..." : "Delete"}
                </Button>
                <Button variant='secondary' asChild>
                  <Link href={`/programs/${program.slug}`}>Update</Link>
                </Button>
              </div>
            </Card>
          ))
        ) : (
          <p className='text-center text-muted-foreground w-full'>
            No programs found.
          </p>
        )}
      </div>
    </div>
  );
}
