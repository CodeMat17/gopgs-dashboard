// components/students/StudentCardList.tsx
import { CourseType, FacultyType } from "@/convex/schema";
import { cn } from "@/lib/utils";
import { Mail, Phone } from "lucide-react";
import { DeleteStudent } from "./DeleteStudent";
import UpdateStudent from "./UpdateStudent";

export interface Student {
  _id: string;
  name: string;
  email: string;
  phone: string;
  regno: string;
  faculty: FacultyType;
  type: CourseType;
}

interface StudentCardListProps {
  students: Student[];
  className?: string;
}

export const StudentCardList = ({
  students,
  className,
}: StudentCardListProps) => {
  return (
    <div className={cn("space-y-4", className)}>
      {students.length === 0 ? (
        <div className='p-12 text-center text-slate-500 rounded-xl border-2 border-dashed'>
          <p className='text-lg'>No students found matching current filters</p>
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {students.map((student) => (
            <article
              key={student._id}
              className='bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow'>
              <div>
                <h3 className='text-lg font-semibold'>{student.name}</h3>
                <p className='text-sm text-muted-foreground'>{student.regno}</p>
              </div>

              <div className='space-y-1 py-3.5'>
                <div className='flex items-center gap-2 '>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-5 w-5 text-slate-400'
                    viewBox='0 0 20 20'
                    fill='currentColor'>
                    <path d='M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z' />
                  </svg>
                  <span className='text-sm truncate'>
                    {student.faculty.replace("Faculty of ", "")}
                  </span>
                </div>

                <div className='space-y-2'>
                  <a
                    href={`mailto:${student.email}`}
                    className='flex items-center gap-2 text-sky-600 hover:text-sky-700 transition-colors'>
                    <Mail className='h-4 w-4' />
                    <span className='text-sm truncate'>{student.email}</span>
                  </a>

                  <div className='flex items-center gap-2'>
                    <a
                      href={`tel:${student.phone}`}
                      className='flex gap-2'>
                      <Phone className='h-4 w-4 text-slate-400' />
                      <span className='text-sm'>{student.phone}</span>
                    </a>
                  </div>
                </div>
              </div>
              <div className='flex items-center justify-between'>
                <p className='inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-slate-100 text-slate-700'>
                  {student.type.toUpperCase()}
                </p>
                <div className='flex gap-2'>
                  <DeleteStudent id={student._id} name={student.name} />

                  <UpdateStudent
                    s_id={student._id}
                    s_name={student.name}
                    s_faculty={student.faculty}
                    s_type={student.type}
                    s_email={student.email}
                    s_phone={student.phone}
                    s_regno={student.regno}
                  />
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
