"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  //   DialogClose,
  DialogContent,
  //   DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

const validFaculties = [
  "Faculty of Arts",
  "Faculty of Education",
  "Faculty of Mgt. & Social Sciences",
  "Faculty of Nat. Science & Environmental Studies",
  "Faculty of Law",
] as const;

const validCourseTypes = ["pgd", "masters", "phd"] as const;

// Validation patterns
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^(\+[0-9]{10,15}|0[0-9]{10})$/;

export default function AddStudents() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [regno, setRegno] = useState("");
  const [faculty, setFaculty] = useState("");
  const [type, setType] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");

  const addStudent = useMutation(api.students.addStudent);

  const validateEmail = (email: string) => {
    if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email address");
      return false;
    }
    setEmailError("");
    return true;
  };

    const validatePhone = (phone: string) => {
      if (!phoneRegex.test(phone)) {
        setPhoneError(
          "Please enter + followed by 10-15 digits or 0 followed by 10 digits"
        );
        return false;
      }
      setPhoneError("");
      return true;
    };




  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Reset errors
    setEmailError("");
    setPhoneError("");

    try {
      // Basic validation
      if (!name || !email || !phone || !regno || !faculty || !type) {
        toast.warning("Warning", {
          description: "Please fill all required fields",
        });
        return;
      }

      // Validate formats
      if (!validateEmail(email) || !validatePhone(phone)) return;

      // Format phone number
      let processedPhone = phone;
      if (phone.startsWith("0")) {
        processedPhone = `+234${phone.slice(1)}`;
      }

      // Ensure international format
      if (!processedPhone.startsWith("+")) {
        processedPhone = `+234${processedPhone}`;
      }

      await addStudent({
        name,
        email,
        phone,
        regno,
        faculty: faculty as (typeof validFaculties)[number],
        type: type as (typeof validCourseTypes)[number],
      });

      toast.success("Done!", {
        description: "Student registered successfully",
      });
      // Reset form
      setName("");
      setEmail("");
      setPhone("");
      setRegno("");
      setFaculty("");
      setType("");
      setOpen(false);
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Failed!", { description: "Failed to register student" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className='mt-2'>Add Student</Button>
      </DialogTrigger>
      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle>Student Data Collection</DialogTitle>
        </DialogHeader>
        <div className='overflow-y-scroll flex-1 h-[calc(100vh-15rem)]'>
          <form onSubmit={handleSubmit} className='space-y-4'>
            {/* Name Field */}
            <div className='space-y-1'>
              <label className='block font-medium text-sm'>Full Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* Email Field */}
            <div className='space-y-2'>
              <label className='block font-medium'>Email</label>
              <Input
                type='email'
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError(""); // Clear error when typing
                }}
                onBlur={() => validateEmail(email)}
                required
              />
              {emailError && (
                <p className='text-red-500 text-sm'>{emailError}</p>
              )}
            </div>

            {/* Phone Field */}
            <div className='space-y-2'>
              <label className='block font-medium'>Phone Number</label>
              <Input
                type='tel'
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  setPhoneError(""); // Clear error when typing
                }}
                onBlur={() => validatePhone(phone)}
                required
              />
              {phoneError && (
                <p className='text-red-500 text-sm'>{phoneError}</p>
              )}
            </div>

            {/* Registration Number */}
            <div className='space-y-2'>
              <label className='block font-medium'>Registration Number</label>
              <Input
                value={regno}
                onChange={(e) => setRegno(e.target.value)}
                required
              />
            </div>
            <div className='flex flex-col sm:flex-row gap-4'>
              {/* Faculty Select */}
              <div className='space-y-2 w-full'>
                <label className='block font-medium'>Faculty</label>
                <Select value={faculty} onValueChange={setFaculty} required>
                  <SelectTrigger className='bg-gray-50 dark:bg-gray-700'>
                    <SelectValue placeholder='Select faculty' />
                  </SelectTrigger>
                  <SelectContent className='bg-gray-300 dark:bg-gray-700'>
                    {validFaculties.map((faculty) => (
                      <SelectItem key={faculty} value={faculty}>
                        {faculty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* Program Type Select */}
              <div className='space-y-2 w-full'>
                <label className='block font-medium'>Program Type</label>
                <Select value={type} onValueChange={setType} required>
                  <SelectTrigger className='bg-gray-50 dark:bg-gray-700'>
                    <SelectValue placeholder='Select program type' />
                  </SelectTrigger>
                  <SelectContent className='bg-gray-300 dark:bg-gray-700'>
                    {validCourseTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button type='submit' className='w-full' disabled={isSubmitting}>
              {isSubmitting ? "Registering..." : "Register Student"}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
