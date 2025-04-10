// components/MainContactForm.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { Minus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface DepartmentContactField {
  email: string;
  tel: string;
}

interface FullContactInfo {
  _id: Id<"contactUs">;
  _creationTime: number;
  address: string;
  email?: { email1: string; email2: string }[];
  phone?: { tel1: string; tel2: string }[];
  officeHours?: { days: string; time: string }[];
  researchOffice?: DepartmentContactField[];
  studentSupport?: DepartmentContactField[];
  admissionOffice?: DepartmentContactField[];
}

interface KeyDepartmentFormProps {
  info: FullContactInfo | null;
}

export default function KeyDepartment({ info }: KeyDepartmentFormProps) {
  const update = useMutation(api.contactUs.updateContactInfo);

  const [researchOffice, setResearchOffice] = useState<
    DepartmentContactField[]
  >([{ email: "", tel: "" }]);
  const [studentSupport, setStudentSupport] = useState<
    DepartmentContactField[]
  >([{ email: "", tel: "" }]);
  const [admissionOffice, setAdmissionOffice] = useState<
    DepartmentContactField[]
  >([{ email: "", tel: "" }]);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (info) {
      setResearchOffice(info.researchOffice || [{ email: "", tel: "" }]);
      setStudentSupport(info.studentSupport || [{ email: "", tel: "" }]);
      setAdmissionOffice(info.admissionOffice || [{ email: "", tel: "" }]);
    }
  }, [info]);

  const handleUpdate = async () => {
    if (!info) return;

     const isFieldEmpty = (data: DepartmentContactField[]) =>
       data.some(({ email, tel }) => !email.trim() || !tel.trim());

     if (
       isFieldEmpty(researchOffice) ||
       isFieldEmpty(studentSupport) ||
       isFieldEmpty(admissionOffice)
     ) {
       toast.warning("Missing fields", {
         description:
           "Please fill in all email and phone fields before updating.",
       });
       return;
     }

    try {
      setIsUpdating(true);
      await update({
        address: info.address,
        email: info.email,
        phone: info.phone,
        officeHours: info.officeHours,
        researchOffice: researchOffice.map(({ email, tel }) => ({
          email,
          tel,
        })),
        studentSupport: studentSupport.map(({ email, tel }) => ({
          email,
          tel,
        })),
        admissionOffice: admissionOffice.map(({ email, tel }) => ({
          email,
          tel,
        })),
      });

      toast.success("Done!", {
        description: "Department info updated successfully",
      });
    } catch (error) {
      toast.error("Error!", {
        description: "Failed to update department info",
      });
      console.log("Update error:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  if (!info) {
    return (
      <div className='flex justify-center py-12'>
        <Minus className='animate-spin mr-3' />
        Please wait...
      </div>
    );
  }

  return (
    <Card className='p-6'>
      <h2 className='text-2xl font-semibold mb-4'>Departmental Contacts</h2>
      <form className='space-y-4'>
        <DepartmentSection
          title='Admission Office'
          emailPlaceholder='Admission office email addr'
          telPlaceholder='Admission office phone no.'
          data={admissionOffice}
          setData={setAdmissionOffice}
        />
        <DepartmentSection
          title='Student Support'
          emailPlaceholder='Student support email addr'
          telPlaceholder='Student support phone no.'
          data={studentSupport}
          setData={setStudentSupport}
        />
        <DepartmentSection
          title='Research Office'
          emailPlaceholder='Research office email addr'
          telPlaceholder='Research office phone no.'
          data={researchOffice}
          setData={setResearchOffice}
        />

        <div className='pt-6'>
          <Button
            type='button'
            onClick={handleUpdate}
            className='w-full'
            disabled={isUpdating}>
            {isUpdating ? "Updating..." : "Update Department Info"}
          </Button>
        </div>
      </form>
    </Card>
  );
}

function DepartmentSection({
  title, emailPlaceholder, telPlaceholder,
  data,
  setData,
}: {
    title: string;
    emailPlaceholder: string
    telPlaceholder: string
  data: DepartmentContactField[];
  setData: React.Dispatch<React.SetStateAction<DepartmentContactField[]>>;
}) {
  return (
    <div className='space-y-0.5'>
      <label className='text-sm text-muted-foreground'>{title}</label>
      {data.map((item, i) => (
        <div key={i} className='flex flex-col sm:flex-row gap-2'>
          <Input
            value={item.email}
            onChange={(e) => {
              const updated = [...data];
              updated[i] = { ...updated[i], email: e.target.value };
              setData(updated);
            }}
            placeholder={emailPlaceholder}
            required
          />
          <Input
            value={item.tel}
            onChange={(e) => {
              const updated = [...data];
              updated[i] = { ...updated[i], tel: e.target.value };
              setData(updated);
            }}
            placeholder={telPlaceholder}
            required
          />
        </div>
      ))}
    </div>
  );
}
