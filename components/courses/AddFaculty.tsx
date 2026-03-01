"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function AddFaculty() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<Id<"faculties"> | null>(null);

  const faculties = useQuery(api.faculties.getFaculties);
  const addFaculty = useMutation(api.faculties.addFaculty);
  const deleteFaculty = useMutation(api.faculties.deleteFaculty);

  const handleAdd = async () => {
    if (!name.trim()) {
      toast.error("Faculty name is required");
      return;
    }
    setIsAdding(true);
    try {
      await addFaculty({ name: name.trim() });
      toast.success("Faculty added", { description: name.trim() });
      setName("");
    } catch (error) {
      toast.error("Failed to add faculty", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (id: Id<"faculties">, facultyName: string) => {
    setDeletingId(id);
    try {
      await deleteFaculty({ id });
      toast.success("Faculty removed", { description: facultyName });
    } catch (error) {
      toast.error("Failed to delete faculty", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Plus size={16} />
          Manage Faculties
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Faculties</DialogTitle>
        </DialogHeader>

        {/* Existing faculties list */}
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {faculties === undefined ? (
            <p className="text-sm text-muted-foreground py-2">Loading...</p>
          ) : faculties.length === 0 ? (
            <p className="text-sm text-muted-foreground py-2">No faculties added yet.</p>
          ) : (
            faculties.map((f) => (
              <div
                key={f._id}
                className="flex items-center justify-between px-3 py-2 rounded-md border bg-muted/40">
                <span className="text-sm">{f.name}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                  disabled={deletingId === f._id}
                  onClick={() => handleDelete(f._id, f.name)}>
                  {deletingId === f._id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            ))
          )}
        </div>

        {/* Add new faculty */}
        <div className="border-t pt-4 space-y-2">
          <label className="block text-sm font-medium">Add New Faculty</label>
          <div className="flex gap-2">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Faculty of Engineering"
              disabled={isAdding}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            />
            <Button onClick={handleAdd} disabled={isAdding} className="shrink-0">
              {isAdding ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus size={16} />
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
