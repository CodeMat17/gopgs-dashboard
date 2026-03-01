"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import dayjs from "dayjs";
import {
  Download,
  ExternalLink,
  FileText,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

type FeeDoc = {
  _id: Id<"fees">;
  title: string;
  description?: string;
  file: Id<"_storage">;
  uploadedAt?: number;
  downloads?: number;
};

// ── Upload Dialog ──────────────────────────────────────────────────────────
function UploadFeeDialog({ onClose }: { onClose: () => void }) {
  const generateUrl = useMutation(api.fees.generateUploadUrl);
  const uploadFees = useMutation(api.fees.uploadFees);
  const fileRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) return toast.error("Enter a title");
    if (!file) return toast.error("Select a PDF file");

    setSaving(true);
    try {
      const uploadUrl = await generateUrl();
      const res = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!res.ok) throw new Error("Upload failed");
      const { storageId } = await res.json();

      await uploadFees({
        title: title.trim(),
        description: description.trim() || undefined,
        storageId,
      });

      toast.success("Fee document uploaded");
      onClose();
    } catch (err) {
      toast.error("Upload failed", { description: `${err}` });
    } finally {
      setSaving(false);
    }
  };

  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>Upload Fee Document</DialogTitle>
      </DialogHeader>
      <div className="space-y-4 py-2">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Title</label>
          <Input
            placeholder="e.g. Fees Structure 2024/2025"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">
            Description{" "}
            <span className="text-muted-foreground font-normal">(optional)</span>
          </label>
          <Textarea
            placeholder="Brief description of this fee document..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">PDF File</label>
          <input
            ref={fileRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          <button
            onClick={() => fileRef.current?.click()}
            className={`w-full border-2 border-dashed rounded-lg p-5 flex flex-col items-center gap-2 transition-colors ${
              file
                ? "border-primary/50 bg-primary/5 text-primary"
                : "border-muted-foreground/30 text-muted-foreground hover:border-primary/40 hover:text-primary"
            }`}>
            <FileText className="w-7 h-7" />
            <span className="text-sm font-medium">
              {file ? file.name : "Click to select PDF"}
            </span>
            {file && (
              <span className="text-xs text-muted-foreground">
                {(file.size / 1024).toFixed(0)} KB
              </span>
            )}
          </button>
        </div>
      </div>

      <DialogFooter className="border-t pt-4 gap-2">
        <Button variant="outline" onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload
            </>
          )}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

// ── Edit Dialog ────────────────────────────────────────────────────────────
function EditFeeDialog({
  fee,
  onClose,
}: {
  fee: FeeDoc;
  onClose: () => void;
}) {
  const generateUrl = useMutation(api.fees.generateUploadUrl);
  const updateFees = useMutation(api.fees.updateFees);
  const fileRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(fee.title);
  const [description, setDescription] = useState(fee.description ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) return toast.error("Enter a title");
    setSaving(true);
    try {
      let storageId: Id<"_storage"> | undefined;
      if (file) {
        const uploadUrl = await generateUrl();
        const res = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });
        if (!res.ok) throw new Error("Upload failed");
        const data = await res.json();
        storageId = data.storageId;
      }

      await updateFees({
        id: fee._id,
        title: title.trim(),
        description: description.trim() || undefined,
        storageId,
      });

      toast.success("Fee document updated");
      onClose();
    } catch (err) {
      toast.error("Update failed", { description: `${err}` });
    } finally {
      setSaving(false);
    }
  };

  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>Edit Fee Document</DialogTitle>
      </DialogHeader>
      <div className="space-y-4 py-2">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Title</label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">
            Description{" "}
            <span className="text-muted-foreground font-normal">(optional)</span>
          </label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">
            Replace PDF{" "}
            <span className="text-muted-foreground font-normal">(optional)</span>
          </label>
          <input
            ref={fileRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          <button
            onClick={() => fileRef.current?.click()}
            className={`w-full border-2 border-dashed rounded-lg p-4 flex items-center gap-3 transition-colors ${
              file
                ? "border-primary/50 bg-primary/5 text-primary"
                : "border-muted-foreground/30 text-muted-foreground hover:border-primary/40 hover:text-primary"
            }`}>
            <FileText className="w-5 h-5 shrink-0" />
            <span className="text-sm truncate">
              {file ? file.name : "Click to replace current PDF"}
            </span>
          </button>
        </div>
      </div>
      <DialogFooter className="border-t pt-4 gap-2">
        <Button variant="outline" onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

// ── Fee Card ───────────────────────────────────────────────────────────────
function FeeCard({ fee }: { fee: FeeDoc }) {
  const fileUrl = useQuery(api.fees.getFeeUrl, { storageId: fee.file });
  const deleteFees = useMutation(api.fees.deleteFees);
  const trackDownload = useMutation(api.fees.trackDownload);

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteFees({ id: fee._id });
      toast.success("Fee document deleted");
      setDeleteOpen(false);
    } catch (err) {
      toast.error("Delete failed", { description: `${err}` });
    } finally {
      setDeleting(false);
    }
  };

  const handleView = async () => {
    if (fileUrl) {
      await trackDownload({ id: fee._id });
      window.open(fileUrl, "_blank");
    }
  };

  return (
    <>
      <div className="flex items-start gap-4 p-4 bg-white dark:bg-gray-900 border rounded-xl hover:shadow-sm transition-shadow">
        <div className="shrink-0 w-10 h-10 rounded-lg bg-red-50 dark:bg-red-950 flex items-center justify-center">
          <FileText className="w-5 h-5 text-red-500" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-semibold truncate">{fee.title}</p>
          {fee.description && (
            <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
              {fee.description}
            </p>
          )}
          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            {fee.uploadedAt && (
              <span>{dayjs(fee.uploadedAt).format("MMM DD, YYYY")}</span>
            )}
            {fee.downloads !== undefined && (
              <span className="flex items-center gap-1">
                <Download className="w-3 h-3" />
                {fee.downloads} downloads
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-primary"
            onClick={handleView}
            disabled={!fileUrl}
            title="View PDF">
            <ExternalLink className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={() => setEditOpen(true)}
            title="Edit">
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={() => setDeleteOpen(true)}
            title="Delete">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Edit */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        {editOpen && (
          <EditFeeDialog fee={fee} onClose={() => setEditOpen(false)} />
        )}
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Fee Document</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete{" "}
            <span className="font-medium text-foreground">{fee.title}</span>?
            This cannot be undone.
          </p>
          <DialogFooter className="gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              disabled={deleting}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}>
              {deleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function FeesPage() {
  const fees = useQuery(api.fees.getAllFees);
  const [uploadOpen, setUploadOpen] = useState(false);

  return (
    <div className="w-full min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Fee Documents</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              {fees === undefined
                ? "Loading..."
                : `${fees.length} document${fees.length !== 1 ? "s" : ""}`}
            </p>
          </div>
          <Button className="gap-2" onClick={() => setUploadOpen(true)}>
            <Plus size={16} />
            Upload Fee
          </Button>
        </div>

        {/* List */}
        {fees === undefined ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        ) : fees.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
            <FileText className="w-10 h-10 opacity-30" />
            <p className="text-sm">No fee documents uploaded yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {fees.map((fee) => (
              <FeeCard key={fee._id} fee={fee as FeeDoc} />
            ))}
          </div>
        )}
      </div>

      {/* Upload dialog */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        {uploadOpen && (
          <UploadFeeDialog onClose={() => setUploadOpen(false)} />
        )}
      </Dialog>
    </div>
  );
}
