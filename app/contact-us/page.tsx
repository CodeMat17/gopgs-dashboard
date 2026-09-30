import ContactEditor from "@/components/contact/ContactEditor";
import { PageHeader } from "@/components/PageHeader";
import { Mail } from "lucide-react";

export default function ContactPage() {
  return (
    <div className='mx-auto w-full max-w-5xl space-y-6 px-4 py-6 sm:px-6 lg:py-8'>
      <PageHeader
        icon={Mail}
        title='Contact Us'
        description='Manage the address, phone numbers, emails and department contacts shown on the public website.'
      />
      <ContactEditor />
    </div>
  );
}
