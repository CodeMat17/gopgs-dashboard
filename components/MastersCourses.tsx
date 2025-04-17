import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { Minus } from "lucide-react";
import CourseCard from "./CourseCard";
import AddMastersCourse from "./courses/AddMastersCourse";

const MastersCourses = () => {
  const mastersCourses = useQuery(api.courses.getCoursesByType, {
    type: "masters",
  });

  return (
    <div>
      <div className='mb-8 flex items-center justify-between gap-2'>
        <h1 className='text-2xl font-medium'>Our Master&apos;s Courses</h1>
        <AddMastersCourse />
      </div>

      {mastersCourses === undefined ? (
        <div className='flex items-center p-8 text-muted-foreground'>
          <Minus className='animate-spin mr-3' /> Master&apos;s courses
          loading...
        </div>
      ) : mastersCourses.length < 1 ? (
        <div className='p-8 text-muted-foreground'>
          No Master&apos;s Courses available at the moment.
        </div>
      ) : (
        <div className='mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
          {mastersCourses.map((msc) => (
            <CourseCard
              key={msc._id}
              id={msc._id}
              course={msc.course}
              duration={msc.duration}
              mode={msc.mode}
              overview={msc.overview}
              whyChoose={msc.whyChoose}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MastersCourses;
