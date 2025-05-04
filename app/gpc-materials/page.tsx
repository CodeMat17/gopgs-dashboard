"use client";




import AddGPCMaterial from "@/components/gpc/AddGPCMaterial";
import { DeleteGPC } from "@/components/gpc/DeleteGPC";
import UpdateGPC from "@/components/gpc/UpdateGPC";
import { Button } from "@/components/ui/button";
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
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { motion } from "framer-motion";
import { Download, Loader, LoaderPinwheel } from "lucide-react";
import { useMemo, useState } from "react";

// Define valid types
type Faculty = (typeof validFaculties)[number];
type CourseLevel = (typeof validCourseLevels)[number];

const validFaculties = [
  "Faculty of Arts",
  "Faculty of Education",
  "Faculty of Mgt. & Social Sciences",
  "Faculty of Nat. Science & Environmental Studies",
  "Faculty of Law",
] as const;

const validCourseLevels = ["pgd", "masters", "phd"] as const;

type Material = {
  _id: Id<"gpc">;
  _creationTime: number;
  faculty: Faculty;
  type: CourseLevel;
  title: string;
  semester: 1 | 2;
  description: string;
  file: Id<"_storage">;
  downloads: number;
};

type SemesterGroup = {
  first: Material[];
  second: Material[];
};

export default function DashboardGPCMaterials() {
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty>();
  const [selectedProgram, setSelectedProgram] = useState<CourseLevel>();

  // Materials query
  const gpcQuery = useQuery(
    api.gpc.getGPCByFacultyType,
    selectedFaculty && selectedProgram
      ? { faculty: selectedFaculty, type: selectedProgram }
      : "skip"
  ) as Material[] | undefined;

  const semesterMaterials = useMemo<SemesterGroup>(
    () => ({
      first: gpcQuery?.filter((m) => m.semester === 1) || [],
      second: gpcQuery?.filter((m) => m.semester === 2) || [],
    }),
    [gpcQuery]
  );

  const isLoading = gpcQuery === undefined;
  const isEmpty = gpcQuery?.length === 0;

  return (
    <div className='w-full bg-gray-50 dark:bg-gray-950'>
      <div className='px-4 pt-6 pb-12 space-y-8 max-w-5xl mx-auto'>
        <div className='flex gap-4 justify-between'>
          <header className='space-y-2'>
            <h1 className='text-3xl font-bold'>GPC Materials Management</h1>
            <p className='text-muted-foreground'>
              Browse and manage GPC materials by faculty and program type.
            </p>
          </header>
          <AddGPCMaterial />
        </div>

        {/* Selection Controls */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl'>
          <div className='space-y-2'>
            <label className='block font-medium'>Select Faculty</label>
            <Select
              value={selectedFaculty}
              onValueChange={(value: Faculty) => setSelectedFaculty(value)}>
              <SelectTrigger className='h-12 bg-gray-100 dark:bg-gray-800'>
                <SelectValue placeholder='Choose faculty' />
              </SelectTrigger>
              <SelectContent className='bg-gray-300 dark:bg-gray-700'>
                {validFaculties.map((faculty) => (
                  <SelectItem key={faculty} value={faculty} className='py-2'>
                    {faculty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-2'>
            <label className='block font-medium'>Program Type</label>
            <Select
              value={selectedProgram}
              onValueChange={(value: CourseLevel) => setSelectedProgram(value)}
              disabled={!selectedFaculty}>
              <SelectTrigger className='h-12 bg-gray-100 dark:bg-gray-800'>
                <SelectValue placeholder='Choose program' />
              </SelectTrigger>
              <SelectContent className='bg-gray-300 dark:bg-gray-700'>
                {validCourseLevels.map((level) => (
                  <SelectItem key={level} value={level} className="py-2">
                    {level.toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Content Area */}
        {selectedFaculty && selectedProgram && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className='space-y-8'>
            {isLoading ? (
              <div className='grid md:grid-cols-2 gap-4'>
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className='h-32 w-full rounded-lg' />
                ))}
              </div>
            ) : isEmpty ? (
              <div className='text-center py-12 text-muted-foreground'>
                No materials found for selected criteria
              </div>
            ) : (
              <div className='space-y-8'>
                {/* First Semester */}
                {semesterMaterials.first.length > 0 && (
                  <section className='space-y-4'>
                    <h2 className='text-2xl font-semibold text-primary'>
                      First Semester Materials
                    </h2>
                    <div className='grid lg:grid-cols-2 gap-4'>
                      {semesterMaterials.first.map((material, index) => (
                        <MaterialCard
                          key={material._id}
                          material={material}
                          index={index}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* Second Semester */}
                {semesterMaterials.second.length > 0 && (
                  <section className='space-y-4'>
                    <h2 className='text-2xl font-semibold text-primary'>
                      Second Semester Materials
                    </h2>
                    <div className='grid lg:grid-cols-2 gap-4'>
                      {semesterMaterials.second.map((material, index) => (
                        <MaterialCard
                          key={material._id}
                          material={material}
                          index={index}
                        />
                      ))}
                    </div>
                  </section>
                )}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

const MaterialCard = ({
  material,
  index,
}: {
  material: Material & { downloads: number };
  index: number;
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadCount, setDownloadCount] = useState(material.downloads);
  const downloadUrl = useQuery(api.gpc.getDownloadUrl, {
    storageId: material.file,
  });
  const trackDownload = useMutation(api.gpc.trackDownload);

  const handleDownload = async () => {
    if (!downloadUrl) return;

    setIsDownloading(true);

    try {
      // Trigger download
      const response = await fetch(downloadUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${material.title}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);

      // Track download and update local state
      const newCount = await trackDownload({ materialId: material._id });
      setDownloadCount(newCount);
    } catch (error) {
      console.error("Download failed:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}>
      <Card className='p-4 hover:shadow-lg transition-shadow'>
        <div className='flex flex-col h-full justify-between'>
          <div>
            <h3 className='text-lg font-semibold'>{material.title}</h3>
            <p className='text-sm text-muted-foreground mt-2'>
              {material.description}
            </p>
          </div>
          <div className='mt-4 flex justify-between items-center'>
            <div className=''>
              <span className='text-sm text-muted-foreground'>
                {downloadCount === undefined ? 0 : downloadCount} downloads
              </span>
            </div>
            <div className='flex gap-1 border rounded-xl'>
              <Button
                size='icon'
                variant='ghost'
                onClick={handleDownload}
                disabled={!downloadUrl}>
                {isDownloading ? (
                  <LoaderPinwheel className='animate-spin w-4 h-4' />
                ) : downloadUrl ? (
                  <Download className='w-4 h-4' />
                ) : (
                  <Loader className='animate-spin w-4 h-4' />
                )}
              </Button>

              <DeleteGPC id={material._id} course={material.title} />
              <UpdateGPC
                c_id={material._id}
                c_title={material.title}
                c_faculty={material.faculty}
                c_description={material.description}
                c_type={material.type}
                c_fileId={material.file}
                c_semester={material.semester}
              />
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
