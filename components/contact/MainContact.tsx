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

interface EmailField {
  email1: string;
  email2: string;
}

interface PhoneField {
  tel1: string;
  tel2: string;
}

interface OfficeHoursField {
  days: string;
  time: string;
}

interface MainContactFormProps {
  info: {
    _id: Id<"contactUs">;
    _creationTime: number;
    address: string;
    email?: EmailField[];
    phone?: PhoneField[];
    officeHours?: OfficeHoursField[];
  } | null;
}

export default function MainContactForm({ info }: MainContactFormProps) {
  const update = useMutation(api.contactUs.updateContactInfo);

  const [address, setAddress] = useState("");
  const [email, setEmail] = useState<EmailField[]>([
    { email1: "", email2: "" },
  ]);
  const [phone, setPhone] = useState<PhoneField[]>([{ tel1: "", tel2: "" }]);
  const [officeHours, setOfficeHours] = useState<OfficeHoursField[]>([
    { days: "", time: "" },
  ]);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (info) {
      setAddress(info.address || "");
      setEmail(info.email || [{ email1: "", email2: "" }]);
      setPhone(info.phone || [{ tel1: "", tel2: "" }]);
      setOfficeHours(info.officeHours || [{ days: "", time: "" }]);
    }
  }, [info]);

  const handleUpdate = async () => {
    try {
      setIsUpdating(true);
      await update({ address, email, phone, officeHours });
      toast.success("Done!", {
        description: "Contact info updated successfully",
      });
    } catch (error) {
      toast.error("Error!", { description: "Failed to update contact info" });
      console.log("Error Msg: ", error);
    } finally {
      setIsUpdating(false);
    }
  };

  if (!info) {
    return (
      <div className='flex justify-center py-12'>
        <Minus className='animate-spin mr-3' /> Please wait...
      </div>
    );
  }

  return (
    <Card className='p-6'>
      <h2 className='text-2xl font-semibold mb-4'>Get in Touch</h2>
      <form className='space-y-4'>
        <div className='space-y-0.5'>
          <label className='text-sm text-muted-foreground'>Address</label>
          <Input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder='Enter campus address'
            required
          />
        </div>

        <div className='space-y-0.5'>
          <label className='text-sm text-muted-foreground'>Email</label>
          {email.map((mail, i) => (
            <div key={i} className='flex flex-col gap-2'>
              <Input
                value={mail.email1}
                onChange={(e) => {
                  const updated = [...email];
                  updated[i] = { ...updated[i], email1: e.target.value };
                  setEmail(updated);
                }}
                placeholder='Enter email address'
                required
              />
              <Input
                value={mail.email2}
                onChange={(e) => {
                  const updated = [...email];
                  updated[i] = { ...updated[i], email2: e.target.value };
                  setEmail(updated);
                }}
                placeholder='Enter another email address'
                required
              />
            </div>
          ))}
        </div>

        <div className='space-y-0.5'>
          <label className='text-sm text-muted-foreground'>Phone</label>
          {phone.map((tel, i) => (
            <div key={i} className='flex flex-col sm:flex-row gap-2'>
              <Input
                value={tel.tel1}
                onChange={(e) => {
                  const updated = [...phone];
                  updated[i] = { ...updated[i], tel1: e.target.value };
                  setPhone(updated);
                }}
                placeholder='Enter phone number'
                required
              />
              <Input
                value={tel.tel2}
                onChange={(e) => {
                  const updated = [...phone];
                  updated[i] = { ...updated[i], tel2: e.target.value };
                  setPhone(updated);
                }}
                placeholder='Enter another phone number'
                required
              />
            </div>
          ))}
        </div>

        <div className='space-y-0.5'>
          <label className='text-sm text-muted-foreground'>Office Hours</label>
          {officeHours.map((office, i) => (
            <div key={i} className='flex items-center gap-3'>
              <Input
                className='w-28'
                value={office.days}
                onChange={(e) => {
                  const updated = [...officeHours];
                  updated[i] = { ...updated[i], days: e.target.value };
                  setOfficeHours(updated);
                }}
                placeholder='Mon - Fri'
              />
              <Input
                value={office.time}
                onChange={(e) => {
                  const updated = [...officeHours];
                  updated[i] = { ...updated[i], time: e.target.value };
                  setOfficeHours(updated);
                }}
                placeholder='8am - 5pm'
              />
            </div>
          ))}
        </div>

        <div className='pt-6'>
          <Button
            type='button'
            onClick={handleUpdate}
            className='w-full'
            disabled={isUpdating}>
            {isUpdating ? "Updating..." : "Update Contact Info"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
