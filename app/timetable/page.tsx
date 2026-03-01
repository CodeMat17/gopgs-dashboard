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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import dayjs from "dayjs";
import {
  BookOpen,
  CalendarDays,
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

type Semester = 1 | 2;

type ExamDoc = {
  _id: Id<"examTimetable">;
  title: string;
  semester?: Semester;
  description?: string;
  file: Id<"_storage">;
  uploadedAt?: number;
  downloads?: number;
};

type LectureDoc = {
  _id: Id<"lectureTimetable">;
  title: string;
  faculty: string;
  semester?: Semester;
  description?: string;
  file: Id<"_storage">;
  uploadedAt?: number;
  downloads?: number;
};

const SEMESTERS: { value: Semester; label: string }[] = [
  { value: 1, label: "Semester 1" },
  { value: 2, label: "Semester 2" },
];

// ── Shared helpers ─────────────────────────────────────────────────────────

function PdfDropZone({
  file,
  fileRef,
  label = "Click to select PDF",
}: {
  file: File | null;
  fileRef: React.RefObject<HTMLInputElement>;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => fileRef.current?.click()}
      className={`w-full border-2 border-dashed rounded-lg p-5 flex flex-col items-center gap-2 transition-colors ${
        file
          ? "border-primary/50 bg-primary/5 text-primary"
          : "border-muted-foreground/30 text-muted-foreground hover:border-primary/40 hover:text-primary"
      }`}>
      <FileText className="w-7 h-7" />
      <span className="text-sm font-medium">{file ? file.name : label}</span>
      {file && (
        <span className="text-xs text-muted-foreground">
          {(file.size / 1024).toFixed(0)} KB
        </span>
      )}
    </button>
  );
}

function ReplacePdfZone({
  file,
  fileRef,
}: {
  file: File | null;
  fileRef: React.RefObject<HTMLInputElement>;
}) {
  return (
    <button
      type="button"
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
  );
}

function SemesterToggle({
  value,
  onChange,
}: {
  value: Semester | undefined;
  onChange: (v: Semester | undefined) => void;
}) {
  return (
    <div className="flex gap-2">
      {SEMESTERS.map((s) => (
        <button
          key={s.value}
          type="button"
          onClick={() => onChange(value === s.value ? undefined : s.value)}
          className={`flex-1 py-1.5 rounded-md text-sm font-medium border transition-colors ${
            value === s.value
              ? "bg-primary text-primary-foreground border-primary"
              : "border-input hover:bg-muted"
          }`}>
          {s.label}
        </button>
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// EXAM TIMETABLE
// ══════════════════════════════════════════════════════════════════════════

function UploadExamSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const generateUrl = useMutation(api.timetable.generateUploadUrl);
  const uploadTimetable = useMutation(api.timetable.uploadTimetable);
  const fileRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [semester, setSemester] = useState<Semester | undefined>();
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setTitle("");
    setSemester(undefined);
    setDescription("");
    setFile(null);
  };

  const handleOpenChange = (v: boolean) => {
    if (!v) reset();
    onOpenChange(v);
  };

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
      await uploadTimetable({
        title: title.trim(),
        semester,
        description: description.trim() || undefined,
        storageId,
      });
      toast.success("Exam timetable uploaded");
      handleOpenChange(false);
    } catch (err) {
      toast.error("Upload failed", { description: `${err}` });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="w-full sm:max-w-md flex flex-col gap-0 p-0">
        <SheetHeader className="px-6 py-5 border-b">
          <SheetTitle>Upload Exam Timetable</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Title</label>
            <Input
              placeholder="e.g. Semester 1 Exams 2024/2025"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              Semester{" "}
              <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <SemesterToggle value={semester} onChange={setSemester} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              Description{" "}
              <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <Textarea
              placeholder="Brief description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
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
            <PdfDropZone file={file} fileRef={fileRef} />
          </div>
        </div>

        <SheetFooter className="px-6 py-4 border-t gap-2">
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={saving}>
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
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function EditExamSheet({
  doc,
  open,
  onOpenChange,
}: {
  doc: ExamDoc;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const generateUrl = useMutation(api.timetable.generateUploadUrl);
  const updateTimetable = useMutation(api.timetable.updateTimetable);
  const fileRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(doc.title);
  const [semester, setSemester] = useState<Semester | undefined>(doc.semester);
  const [description, setDescription] = useState(doc.description ?? "");
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
        storageId = (await res.json()).storageId;
      }
      await updateTimetable({
        id: doc._id,
        title: title.trim(),
        semester,
        description: description.trim() || undefined,
        storageId,
      });
      toast.success("Timetable updated");
      onOpenChange(false);
    } catch (err) {
      toast.error("Update failed", { description: `${err}` });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md flex flex-col gap-0 p-0">
        <SheetHeader className="px-6 py-5 border-b">
          <SheetTitle>Edit Exam Timetable</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Title</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              Semester{" "}
              <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <SemesterToggle value={semester} onChange={setSemester} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              Description{" "}
              <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
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
            <ReplacePdfZone file={file} fileRef={fileRef} />
          </div>
        </div>

        <SheetFooter className="px-6 py-4 border-t gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}>
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
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function ExamCard({ doc }: { doc: ExamDoc }) {
  const fileUrl = useQuery(api.timetable.getTimetableUrl, {
    storageId: doc.file,
  });
  const deleteTimetable = useMutation(api.timetable.deleteTimetable);
  const trackDownload = useMutation(api.timetable.trackDownload);

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleView = async () => {
    if (fileUrl) {
      await trackDownload({ id: doc._id });
      window.open(fileUrl, "_blank");
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteTimetable({ id: doc._id });
      toast.success("Timetable deleted");
      setDeleteOpen(false);
    } catch (err) {
      toast.error("Delete failed", { description: `${err}` });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="flex items-start gap-4 p-4 bg-white dark:bg-gray-900 border rounded-xl hover:shadow-sm transition-shadow">
        <div className="shrink-0 w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950 flex items-center justify-center">
          <CalendarDays className="w-5 h-5 text-blue-500" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold truncate">{doc.title}</p>
            {doc.semester && (
              <span className="text-xs bg-muted px-2 py-0.5 rounded-full font-medium">
                Semester {doc.semester}
              </span>
            )}
          </div>
          {doc.description && (
            <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
              {doc.description}
            </p>
          )}
          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            {doc.uploadedAt && (
              <span>{dayjs(doc.uploadedAt).format("MMM DD, YYYY")}</span>
            )}
            {doc.downloads !== undefined && (
              <span className="flex items-center gap-1">
                <Download className="w-3 h-3" />
                {doc.downloads} downloads
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

      <EditExamSheet doc={doc} open={editOpen} onOpenChange={setEditOpen} />

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Timetable</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete{" "}
            <span className="font-medium text-foreground">{doc.title}</span>?
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

function ExamTimetableTab() {
  const timetables = useQuery(api.timetable.getAllTimetables);
  const [uploadOpen, setUploadOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {timetables === undefined
            ? "Loading..."
            : `${timetables.length} timetable${timetables.length !== 1 ? "s" : ""}`}
        </p>
        <Button size="sm" className="gap-2" onClick={() => setUploadOpen(true)}>
          <Plus size={14} />
          Upload
        </Button>
      </div>

      {timetables === undefined ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : timetables.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
          <CalendarDays className="w-10 h-10 opacity-30" />
          <p className="text-sm">No exam timetables uploaded yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {timetables.map((doc) => (
            <ExamCard key={doc._id} doc={doc as ExamDoc} />
          ))}
        </div>
      )}

      <UploadExamSheet open={uploadOpen} onOpenChange={setUploadOpen} />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// LECTURE TIMETABLE
// ══════════════════════════════════════════════════════════════════════════

function UploadLectureSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const generateUrl = useMutation(api.lectureTimetable.generateUploadUrl);
  const uploadLecture = useMutation(api.lectureTimetable.uploadLectureTimetable);
  const faculties = useQuery(api.faculties.getFaculties);
  const fileRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [faculty, setFaculty] = useState("");
  const [semester, setSemester] = useState<Semester | undefined>();
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setTitle("");
    setFaculty("");
    setSemester(undefined);
    setDescription("");
    setFile(null);
  };

  const handleOpenChange = (v: boolean) => {
    if (!v) reset();
    onOpenChange(v);
  };

  const handleSubmit = async () => {
    if (!title.trim()) return toast.error("Enter a title");
    if (!faculty) return toast.error("Select a department");
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
      await uploadLecture({
        title: title.trim(),
        faculty,
        semester,
        description: description.trim() || undefined,
        storageId,
      });
      toast.success("Lecture timetable uploaded");
      handleOpenChange(false);
    } catch (err) {
      toast.error("Upload failed", { description: `${err}` });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="w-full sm:max-w-md flex flex-col gap-0 p-0">
        <SheetHeader className="px-6 py-5 border-b">
          <SheetTitle>Upload Lecture Timetable</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Title</label>
            <Input
              placeholder="e.g. Lecture Timetable Semester 1 2024"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Department</label>
            <Select value={faculty} onValueChange={setFaculty}>
              <SelectTrigger>
                <SelectValue placeholder="Select department..." />
              </SelectTrigger>
              <SelectContent>
                {faculties?.map((f) => (
                  <SelectItem key={f._id} value={f.name}>
                    {f.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              Semester{" "}
              <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <SemesterToggle value={semester} onChange={setSemester} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              Description{" "}
              <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <Textarea
              placeholder="Brief description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
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
            <PdfDropZone file={file} fileRef={fileRef} />
          </div>
        </div>

        <SheetFooter className="px-6 py-4 border-t gap-2">
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={saving}>
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
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function EditLectureSheet({
  doc,
  open,
  onOpenChange,
}: {
  doc: LectureDoc;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const generateUrl = useMutation(api.lectureTimetable.generateUploadUrl);
  const updateLecture = useMutation(api.lectureTimetable.updateLectureTimetable);
  const faculties = useQuery(api.faculties.getFaculties);
  const fileRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(doc.title);
  const [faculty, setFaculty] = useState(doc.faculty);
  const [semester, setSemester] = useState<Semester | undefined>(doc.semester);
  const [description, setDescription] = useState(doc.description ?? "");
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
        storageId = (await res.json()).storageId;
      }
      await updateLecture({
        id: doc._id,
        title: title.trim(),
        faculty,
        semester,
        description: description.trim() || undefined,
        storageId,
      });
      toast.success("Lecture timetable updated");
      onOpenChange(false);
    } catch (err) {
      toast.error("Update failed", { description: `${err}` });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md flex flex-col gap-0 p-0">
        <SheetHeader className="px-6 py-5 border-b">
          <SheetTitle>Edit Lecture Timetable</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Title</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Department</label>
            <Select value={faculty} onValueChange={setFaculty}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {faculties?.map((f) => (
                  <SelectItem key={f._id} value={f.name}>
                    {f.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              Semester{" "}
              <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <SemesterToggle value={semester} onChange={setSemester} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              Description{" "}
              <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
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
            <ReplacePdfZone file={file} fileRef={fileRef} />
          </div>
        </div>

        <SheetFooter className="px-6 py-4 border-t gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}>
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
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function LectureCard({ doc }: { doc: LectureDoc }) {
  const fileUrl = useQuery(api.lectureTimetable.getLectureTimetableUrl, {
    storageId: doc.file,
  });
  const deleteLecture = useMutation(api.lectureTimetable.deleteLectureTimetable);
  const trackDownload = useMutation(api.lectureTimetable.trackDownload);

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleView = async () => {
    if (fileUrl) {
      await trackDownload({ id: doc._id });
      window.open(fileUrl, "_blank");
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteLecture({ id: doc._id });
      toast.success("Lecture timetable deleted");
      setDeleteOpen(false);
    } catch (err) {
      toast.error("Delete failed", { description: `${err}` });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="flex items-start gap-4 p-4 bg-white dark:bg-gray-900 border rounded-xl hover:shadow-sm transition-shadow">
        <div className="shrink-0 w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center">
          <BookOpen className="w-5 h-5 text-emerald-500" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold truncate">{doc.title}</p>
            {doc.semester && (
              <span className="text-xs bg-muted px-2 py-0.5 rounded-full font-medium">
                Semester {doc.semester}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{doc.faculty}</p>
          {doc.description && (
            <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
              {doc.description}
            </p>
          )}
          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            {doc.uploadedAt && (
              <span>{dayjs(doc.uploadedAt).format("MMM DD, YYYY")}</span>
            )}
            {doc.downloads !== undefined && (
              <span className="flex items-center gap-1">
                <Download className="w-3 h-3" />
                {doc.downloads} downloads
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

      <EditLectureSheet doc={doc} open={editOpen} onOpenChange={setEditOpen} />

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Lecture Timetable</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete{" "}
            <span className="font-medium text-foreground">{doc.title}</span>?
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

function LectureTimetableTab() {
  const allDocs = useQuery(api.lectureTimetable.getAllLectureTimetables);
  const faculties = useQuery(api.faculties.getFaculties);
  const [selectedFaculty, setSelectedFaculty] = useState<string>("all");
  const [uploadOpen, setUploadOpen] = useState(false);

  const filtered =
    allDocs === undefined
      ? undefined
      : selectedFaculty === "all"
        ? allDocs
        : allDocs.filter((d) => d.faculty === selectedFaculty);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 flex-wrap">
        <Select value={selectedFaculty} onValueChange={setSelectedFaculty}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="All departments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {faculties?.map((f) => (
              <SelectItem key={f._id} value={f.name}>
                {f.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground flex-1">
          {filtered === undefined
            ? "Loading..."
            : `${filtered.length} timetable${filtered.length !== 1 ? "s" : ""}`}
        </p>
        <Button size="sm" className="gap-2" onClick={() => setUploadOpen(true)}>
          <Plus size={14} />
          Upload
        </Button>
      </div>

      {filtered === undefined ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
          <BookOpen className="w-10 h-10 opacity-30" />
          <p className="text-sm">No lecture timetables uploaded yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((doc) => (
            <LectureCard key={doc._id} doc={doc as LectureDoc} />
          ))}
        </div>
      )}

      <UploadLectureSheet open={uploadOpen} onOpenChange={setUploadOpen} />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// PAGE
// ══════════════════════════════════════════════════════════════════════════

export default function TimetablePage() {
  return (
    <div className="w-full min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-8">

        <div>
          <h1 className="text-3xl font-bold tracking-tight">Timetables</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage exam and lecture timetable PDFs
          </p>
        </div>

        <Tabs defaultValue="exam">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="exam" className="gap-2">
              <CalendarDays className="w-4 h-4" />
              Exam Timetable
            </TabsTrigger>
            <TabsTrigger value="lecture" className="gap-2">
              <BookOpen className="w-4 h-4" />
              Lecture Timetable
            </TabsTrigger>
          </TabsList>

          <TabsContent value="exam" className="mt-6">
            <ExamTimetableTab />
          </TabsContent>

          <TabsContent value="lecture" className="mt-6">
            <LectureTimetableTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
