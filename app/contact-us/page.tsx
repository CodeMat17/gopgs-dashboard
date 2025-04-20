// app/contact/page.tsx
"use client";
import MainContact from "@/components/contact/MainContact";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";

// Create type from schema

export default function ContactPage() {
  const info = useQuery(api.contactUs.getContactInfo);

  return (
    <div className='w-full min-h-screen max-w-5xl mx-auto px-4 pb-12'>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}>
        <h1 className='text-4xl font-bold mb-8 text-center'>Contact Us</h1>

        <div className='grid lg:grid-cols-2 gap-8'>
          {/* Contact Information */}
          <div className='space-y-6'>
            <motion.div
              initial={{ x: -20 }}
              animate={{ x: 0 }}
              transition={{ delay: 0.2 }}>
              {info?.address && (
                <MainContact info={info as Required<typeof info>} />
              )}
            </motion.div>
          </div>
        </div>

        {/* <UniversityMap /> */}

        {/* Map Section */}
      </motion.div>
    </div>
  );
}
