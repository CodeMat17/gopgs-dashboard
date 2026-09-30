"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import {
  BookOpen,
  Clock,
  GraduationCap,
  HeartHandshake,
  Loader2,
  LucideIcon,
  Mail,
  MapPin,
  Phone,
  Plus,
  RotateCcw,
  Save,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type DepartmentKey = "admissionOffice" | "researchOffice" | "studentSupport";

interface DepartmentContact {
  email: string;
  tel: string;
}

interface ContactForm {
  address: string;
  email1: string;
  email2: string;
  tel1: string;
  tel2: string;
  officeHours: { days: string; time: string }[];
  admissionOffice: DepartmentContact;
  researchOffice: DepartmentContact;
  studentSupport: DepartmentContact;
}

const DEPARTMENTS: {
  key: DepartmentKey;
  title: string;
  description: string;
  icon: LucideIcon;
  accent: string;
}[] = [
  {
    key: "admissionOffice",
    title: "Admissions Office",
    description: "Enquiries about applications and admission status",
    icon: GraduationCap,
    accent: "bg-primary/10 text-primary",
  },
  {
    key: "researchOffice",
    title: "Research Office",
    description: "Theses, supervision and research matters",
    icon: BookOpen,
    accent: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
  },
  {
    key: "studentSupport",
    title: "Student Support",
    description: "Welfare, records and general student help",
    icon: HeartHandshake,
    accent: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function toForm(info: Doc<"contactUs"> | null): ContactForm {
  const dept = (key: DepartmentKey): DepartmentContact => ({
    email: info?.[key]?.[0]?.email ?? "",
    tel: info?.[key]?.[0]?.tel ?? "",
  });
  return {
    address: info?.address ?? "",
    email1: info?.email?.[0]?.email1 ?? "",
    email2: info?.email?.[0]?.email2 ?? "",
    tel1: info?.phone?.[0]?.tel1 ?? "",
    tel2: info?.phone?.[0]?.tel2 ?? "",
    officeHours: info?.officeHours?.length
      ? info.officeHours.map(({ days, time }) => ({ days, time }))
      : [{ days: "", time: "" }],
    admissionOffice: dept("admissionOffice"),
    researchOffice: dept("researchOffice"),
    studentSupport: dept("studentSupport"),
  };
}

function trimDept({ email, tel }: DepartmentContact) {
  const cleaned = { email: email.trim(), tel: tel.trim() };
  // An empty department is stored as [] so the public site hides its card.
  return cleaned.email || cleaned.tel ? [cleaned] : [];
}

function validate(form: ContactForm): string | null {
  if (!form.address.trim()) return "Address is required.";
  const emails: [string, string][] = [
    ["Primary email", form.email1],
    ["Secondary email", form.email2],
    ...DEPARTMENTS.map(
      (d) => [`${d.title} email`, form[d.key].email] as [string, string]
    ),
  ];
  for (const [label, value] of emails) {
    if (value.trim() && !EMAIL_RE.test(value.trim())) {
      return `${label} is not a valid email address.`;
    }
  }
  return null;
}

// ── Layout helpers ────────────────────────────────────────────────────────────
function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className='rounded-xl border bg-card shadow-sm'>
      <div className='border-b px-5 py-4 sm:px-6'>
        <h2 className='font-semibold'>{title}</h2>
        <p className='text-sm text-muted-foreground'>{description}</p>
      </div>
      <div className='p-5 sm:p-6'>{children}</div>
    </section>
  );
}

function IconInput({
  id,
  icon: Icon,
  ...props
}: React.ComponentProps<typeof Input> & { icon: LucideIcon }) {
  return (
    <div className='relative'>
      <Icon className='pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' />
      <Input id={id} className='pl-9' {...props} />
    </div>
  );
}

// ── Editor ────────────────────────────────────────────────────────────────────
export default function ContactEditor() {
  const info = useQuery(api.contactUs.getContactInfo);
  const update = useMutation(api.contactUs.updateContactInfo);

  const baseline = useMemo(
    () => (info === undefined ? null : toForm(info)),
    [info]
  );
  const [form, setForm] = useState<ContactForm | null>(null);
  const [saving, setSaving] = useState(false);

  // Load (or reload after a save elsewhere) while there are no local edits.
  const isDirty =
    form !== null &&
    baseline !== null &&
    JSON.stringify(form) !== JSON.stringify(baseline);

  useEffect(() => {
    if (baseline && !isDirty) setForm(baseline);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseline]);

  if (!form) {
    return (
      <div className='space-y-6'>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className='space-y-4 rounded-xl border bg-card p-6'>
            <Skeleton className='h-5 w-40' />
            <Skeleton className='h-10 w-full' />
            <Skeleton className='h-10 w-full' />
          </div>
        ))}
      </div>
    );
  }

  const set = <K extends keyof ContactForm>(key: K, value: ContactForm[K]) =>
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));

  const setDept = (key: DepartmentKey, field: keyof DepartmentContact, value: string) =>
    setForm((prev) =>
      prev ? { ...prev, [key]: { ...prev[key], [field]: value } } : prev
    );

  const setHours = (index: number, field: "days" | "time", value: string) =>
    set(
      "officeHours",
      form.officeHours.map((row, i) =>
        i === index ? { ...row, [field]: value } : row
      )
    );

  const handleSave = async () => {
    const error = validate(form);
    if (error) {
      toast.warning("Please check the form", { description: error });
      return;
    }

    try {
      setSaving(true);
      const payload = {
        address: form.address.trim(),
        email: [{ email1: form.email1.trim(), email2: form.email2.trim() }],
        phone: [{ tel1: form.tel1.trim(), tel2: form.tel2.trim() }],
        officeHours: form.officeHours
          .map(({ days, time }) => ({ days: days.trim(), time: time.trim() }))
          .filter(({ days, time }) => days || time),
        admissionOffice: trimDept(form.admissionOffice),
        researchOffice: trimDept(form.researchOffice),
        studentSupport: trimDept(form.studentSupport),
      };
      await update(payload);
      // Show the normalised values; they match the next server snapshot.
      setForm(toForm(payload as Doc<"contactUs">));
      toast.success("Contact details saved", {
        description: "The public Contact page is now up to date.",
      });
    } catch (err) {
      console.error("Contact update failed:", err);
      toast.error("Could not save contact details", {
        description: "Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      className='space-y-6 pb-24'
      onSubmit={(e) => {
        e.preventDefault();
        handleSave();
      }}>
      {/* General */}
      <Section
        title='General contact'
        description='Shown at the top of the Contact page and in the site footer.'>
        <div className='grid gap-5'>
          <div className='space-y-2'>
            <Label htmlFor='address'>Address</Label>
            <div className='relative'>
              <MapPin className='pointer-events-none absolute left-3 top-3 size-4 text-muted-foreground' />
              <Textarea
                id='address'
                rows={2}
                className='resize-none pl-9'
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
                placeholder='Postgraduate School, Godfrey Okoye University, Enugu'
              />
            </div>
          </div>

          <div className='grid gap-5 sm:grid-cols-2'>
            <div className='space-y-2'>
              <Label htmlFor='email1'>Primary email</Label>
              <IconInput
                id='email1'
                type='email'
                icon={Mail}
                value={form.email1}
                onChange={(e) => set("email1", e.target.value)}
                placeholder='pgschool@gouni.edu.ng'
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='email2'>Secondary email</Label>
              <IconInput
                id='email2'
                type='email'
                icon={Mail}
                value={form.email2}
                onChange={(e) => set("email2", e.target.value)}
                placeholder='Optional'
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='tel1'>Primary phone</Label>
              <IconInput
                id='tel1'
                type='tel'
                icon={Phone}
                value={form.tel1}
                onChange={(e) => set("tel1", e.target.value)}
                placeholder='+234 800 000 0000'
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='tel2'>Secondary phone</Label>
              <IconInput
                id='tel2'
                type='tel'
                icon={Phone}
                value={form.tel2}
                onChange={(e) => set("tel2", e.target.value)}
                placeholder='Optional'
              />
            </div>
          </div>

          <div className='space-y-2'>
            <Label>Office hours</Label>
            <div className='space-y-2'>
              {form.officeHours.map((row, i) => (
                <div key={i} className='flex items-center gap-2'>
                  <IconInput
                    icon={Clock}
                    aria-label='Days'
                    className='pl-9 sm:w-48'
                    value={row.days}
                    onChange={(e) => setHours(i, "days", e.target.value)}
                    placeholder='Mon – Fri'
                  />
                  <Input
                    aria-label='Time'
                    value={row.time}
                    onChange={(e) => setHours(i, "time", e.target.value)}
                    placeholder='8:00am – 4:00pm'
                  />
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    className='shrink-0 text-muted-foreground hover:text-destructive'
                    aria-label='Remove office hours row'
                    disabled={form.officeHours.length === 1}
                    onClick={() =>
                      set(
                        "officeHours",
                        form.officeHours.filter((_, j) => j !== i)
                      )
                    }>
                    <Trash2 className='size-4' />
                  </Button>
                </div>
              ))}
            </div>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={() =>
                set("officeHours", [...form.officeHours, { days: "", time: "" }])
              }>
              <Plus className='size-4' /> Add hours
            </Button>
          </div>
        </div>
      </Section>

      {/* Departments */}
      <Section
        title='Department contacts'
        description='Each office appears as its own card on the Contact page. Leave both fields empty to hide an office.'>
        <div className='grid gap-4 lg:grid-cols-3'>
          {DEPARTMENTS.map((dept) => (
            <div key={dept.key} className='space-y-4 rounded-lg border bg-background/50 p-4'>
              <div className='flex items-start gap-3'>
                <div
                  className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${dept.accent}`}>
                  <dept.icon className='size-5' />
                </div>
                <div>
                  <h3 className='font-semibold leading-tight'>{dept.title}</h3>
                  <p className='text-xs text-muted-foreground'>{dept.description}</p>
                </div>
              </div>
              <div className='space-y-2'>
                <Label htmlFor={`${dept.key}-email`}>Email</Label>
                <IconInput
                  id={`${dept.key}-email`}
                  type='email'
                  icon={Mail}
                  value={form[dept.key].email}
                  onChange={(e) => setDept(dept.key, "email", e.target.value)}
                  placeholder='office@gouni.edu.ng'
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor={`${dept.key}-tel`}>Phone</Label>
                <IconInput
                  id={`${dept.key}-tel`}
                  type='tel'
                  icon={Phone}
                  value={form[dept.key].tel}
                  onChange={(e) => setDept(dept.key, "tel", e.target.value)}
                  placeholder='+234 800 000 0000'
                />
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Save bar */}
      <div className='sticky bottom-4 z-20'>
        <div className='flex flex-col gap-3 rounded-xl border bg-card/95 p-3 shadow-lg backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:px-4'>
          <p className='text-sm text-muted-foreground'>
            {isDirty ? (
              <span className='inline-flex items-center gap-2 font-medium text-foreground'>
                <span className='size-2 rounded-full bg-amber-500' /> You have
                unsaved changes
              </span>
            ) : (
              "All changes saved"
            )}
          </p>
          <div className='flex gap-2'>
            <Button
              type='button'
              variant='ghost'
              disabled={!isDirty || saving}
              onClick={() => baseline && setForm(baseline)}>
              <RotateCcw className='size-4' /> Discard
            </Button>
            <Button type='submit' disabled={!isDirty || saving}>
              {saving ? (
                <Loader2 className='size-4 animate-spin' />
              ) : (
                <Save className='size-4' />
              )}
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
