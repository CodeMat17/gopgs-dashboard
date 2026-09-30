"use client";
import { CreateStaff } from "@/components/staff/CreateStaff";
import { DeleteStaff } from "@/components/staff/DeleteStaff";
import { StaffFormValues } from "@/components/staff/formSchema";
import { UpdateStaff } from "@/components/staff/UpdateStaff";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { AnimatePresence, motion } from "framer-motion";
import { Linkedin, Mail, Minus, Plus, UserRound } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { errorMessage } from "@/lib/utils";

export default function StaffPage() {
  const staffMembers = useQuery(api.staff.getStaff);
  const [selectedStaff, setSelectedStaff] = useState<Doc<"staff"> | null>(null);
  const [deleteStaffId, setDeleteStaffId] = useState<Id<"staff"> | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Mutations
  const updateMutation = useMutation(api.staff.updateStaff);
  const deleteMutation = useMutation(api.staff.deleteStaff);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleUpdate = async (values: StaffFormValues) => {
    if (!selectedStaff) return;

    setIsUpdating(true);
    try {
      await updateMutation({
        id: selectedStaff._id,
        name: values.name,
        role: values.role,
        email: values.email,
        linkedin: values.linkedin || undefined,
        profile: values.profile || undefined,
        image: values.image,
        removeImage: values.removeImage,
      });

      setSelectedStaff(null);
      toast.success("Done!", {
        description: "Staff member updated successfully",
      });
    } catch (error) {
      toast.error("Failed to update staff member", {
        description: errorMessage(error),
      });
      console.error("Update error:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteStaffId) return;
    setIsDeleting(true);
    try {
      await deleteMutation({ id: deleteStaffId });
      setDeleteStaffId(null);
      toast.success("Staff member deleted successfully");
    } catch (error) {
      toast.error("Failed to delete staff member", {
        description: errorMessage(error),
      });
      console.error("Delete error:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className='w-full max-w-5xl mx-auto px-4 py-12'>
      <div className='flex justify-between items-center mb-8'>
        <div>
          <h1 className='text-3xl font-bold'>Our Team</h1>
          <p className='text-muted-foreground'>Manage your team members</p>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className='w-4 h-4 mr-2' /> Add Member
        </Button>
      </div>

      {!staffMembers ? (
        <div className='flex items-center justify-center px-4 py-32'>
          No data found at the moment.
        </div>
      ) : staffMembers.length === 0 ? (
        <div className='flex items-center justify-center px-4 py-32'>
          <Minus className='animate-spin mr-3' /> Loading...
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
          <AnimatePresence>
            {staffMembers?.map((member) => (
              <motion.div
                key={member._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}>
                <Card className='hover:shadow-lg transition-shadow rounded-lg overflow-hidden group relative'>
                  <div className='relative w-full aspect-square'>
                    {member.imageUrl ? (
                      <Image
                        alt={member.name}
                        src={member.imageUrl}
                        fill
                        className='object-cover'
                        sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw'
                      />
                    ) : (
                      <div className='absolute inset-0 flex items-center justify-center bg-muted'>
                        <UserRound className='w-16 h-16 text-muted-foreground' />
                      </div>
                    )}
                    <div className='absolute inset-0 bg-gradient-to-t from-black/60 to-transparent' />
                  </div>

                  <div className='p-4 space-y-2'>
                    <div className='text-center'>
                      <h2 className='text-xl font-semibold text-foreground'>
                        {member.name}
                      </h2>
                      <p className='text-sm text-muted-foreground'>
                        {member.role}
                      </p>
                    </div>

                    <div className='flex justify-center gap-4'>
                      <a
                        href={`mailto:${member.email}`} // Fixed syntax
                        className='text-primary hover:text-primary/80 transition-colors'>
                        <Mail className='w-5 h-5' />
                      </a>
                      {member.linkedin && (
                        <a
                          href={member.linkedin}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-primary hover:text-primary/80 transition-colors'>
                          <Linkedin className='w-5 h-5' />
                        </a>
                      )}
                    </div>

                    <div className='flex gap-2'>
                      <Button
                        variant='outline'
                        className='w-full'
                        onClick={() => setSelectedStaff(member)}>
                        Edit
                      </Button>
                      <Button
                        variant='destructive'
                        className='w-full'
                        onClick={() => setDeleteStaffId(member._id)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Create Staff Modal */}
      <CreateStaff
        open={isCreating}
        onOpenChange={setIsCreating}
      />

      {/* Update Staff Modal */}
      {selectedStaff && (
        <UpdateStaff
          key={selectedStaff._id}
          open={!!selectedStaff}
          onOpenChange={(open) => !open && setSelectedStaff(null)}
          onSubmit={handleUpdate}
          isSubmitting={isUpdating}
          staff={selectedStaff}
        />
      )}

      {/* Delete Staff Confirmation Modal */}
      <DeleteStaff
        open={!!deleteStaffId}
        onOpenChange={(open) => !open && setDeleteStaffId(null)}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}
