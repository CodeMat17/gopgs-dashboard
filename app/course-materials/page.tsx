"use client";

import AddCourseModal from "@/components/courses/AddCourse";
import { DeleteCourse } from "@/components/courses/DeleteCourse";
import UpdateCourse from "@/components/courses/UpdateCourse";
import { Button } from "@/components/ui/button";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";

export default function UploadMaterial() {
  const materials = useQuery(api.materials.getAll);
  const downloadFile = useMutation(api.materials.downloadFile);

  const handleDownload = async (storageId: Id<"_storage">, title: string) => {
    try {
      const url = await downloadFile({ storageId });
      const response = await fetch(url);
      const blob = await response.blob();

      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `${title}.pdf`;
      link.click();
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  return (
    <div className='max-w-3xl mx-auto p-4 space-y-6'>
      <div className='flex flex-col sm:flex-row sm:justify-between items-center gap-4'>
        <h1 className='text-3xl font-bold '>Course Materials</h1>
        <AddCourseModal />
      </div>

      <div className='space-y-4 mt-8'>
        {materials?.length === 0 ? (
          <p className='text-muted-foreground text-center'>
            No materials uploaded yet
          </p>
        ) : (
          <div className='grid gap-4 md:grid-cols-2 mt-12'>
            {materials?.map((material) => (
              <div key={material._id} className='p-4 border rounded-lg'>
                <div className='flex justify-between items-start'>
                  <div>
                    <h3 className='font-medium'>{material.title}</h3>
                    <p className='text-sm text-muted-foreground'>
                      {material.faculty} • {material.type.toUpperCase()}
                    </p>
                    <p className='text-sm mt-2'>{material.description}</p>
                  </div>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() =>
                      handleDownload(material.file, material.title)
                    }>
                    Download PDF
                  </Button>
                </div>
                <div className="pt-4 flex justify-end gap-4">
                        <DeleteCourse id={material._id} course={material.title} />
                        <UpdateCourse c_id={material._id} c_faculty={material.faculty} c_type={material.type} c_title={material.title} c_description={material.description} c_fileId={material.file} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
