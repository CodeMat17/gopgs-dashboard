import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { Minus } from "lucide-react";
import CourseCard from "./CourseCard";
import AddPhdCourse from "./courses/AddPhdCourse";

const PhdCourses = () => {
  const phdCourses = useQuery(api.courses.getCoursesByType, { type: "phd" });

  return (
    <div>
      <div className="mb-8 flex items-center justify-between gap-2">
   <h1 className='text-2xl font-medium'>Our PhD Courses</h1>
        <AddPhdCourse />
      </div>
   
      {phdCourses === undefined ? (
        <div className='flex items-center p-8 text-muted-foreground'>
          <Minus className='animate-spin mr-3' /> PhD courses loading...
        </div>
      ) : phdCourses.length < 1 ? (
        <div className='p-8 text-muted-foreground'>
          No PhD Courses available at the moment.
        </div>
      ) : (
        <div className='mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
          {phdCourses.map((phd) => (
            <CourseCard
              key={phd._id}
              id={phd._id}
              course={phd.course}
              overview={phd.overview}
              duration={phd.duration}
              mode={phd.mode}
              whyChoose={phd.whyChoose}
              faculty={phd.faculty ?? ''}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PhdCourses;
