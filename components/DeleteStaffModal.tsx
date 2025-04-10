// components/DeleteStaffModal.tsx
"use client";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface DeleteStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  staffName?: string;
}

export function DeleteStaffModal({
  isOpen,
  onClose,
  onConfirm,
  staffName,
}: DeleteStaffModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className='fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4'
          onClick={onClose}>
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className='bg-background rounded-lg p-6 max-w-md w-full text-center'
            onClick={(e) => e.stopPropagation()}>
            <Trash2 className='w-12 h-12 text-destructive mx-auto mb-4' />
            <h3 className='text-xl font-semibold mb-2'>Confirm Deletion</h3>
            <p className='text-muted-foreground mb-6'>
              Are you sure you want to permanently delete{" "}
              {staffName ? (
                <span className='font-semibold'>{staffName}</span>
              ) : (
                "this staff member"
              )}
              ?
            </p>
            <div className='flex gap-2 justify-end'>
              <Button variant='outline' onClick={onClose}>
                Cancel
              </Button>
              <Button variant='destructive' onClick={onConfirm}>
                Confirm Delete
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
