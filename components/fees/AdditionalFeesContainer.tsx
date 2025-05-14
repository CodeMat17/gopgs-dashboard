"use client";

import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { Minus } from "lucide-react";

const AdditionalFeesContainer = () => {
  const additionalFees = useQuery(api.fees.getAdditionalFees);

  if (additionalFees === undefined) {
    return (
      <div className='w-full px-4 h-[500px] xl:max-w-[280px] xl:mt-20 bg-gray-100 dark:bg-gray-800 flex items-center justify-center'>
        <Minus className='animate-spin' />
      </div>
    );
  }

  return (
    <div className='p-4 mt-4 bg-gray-900 rounded-xl'>
      <div className=' mb-3'>
        <h2 className='text-xl font-semibold mb-2 uppercase '>
          Additional Fees
        </h2>
      </div>
      <div className="py-8">

      </div>

      {additionalFees.length === 0 ? (
        <div className='flex items-center justify-center py-8'>
          <Minus className='animate-spin mr-3' /> loading...
        </div>
      ) : (
        <div className='lg:text-sm'>
          {additionalFees.map((fee, index) => (
            <div
              key={fee._id}
              className={`flex justify-between ${index % 2 === 0 ? "bg-gray-800" : "bg-blue-900"} px-4 py-1.5 rounded-full relative`}>
              <p>{fee.title} </p>
              <p>{fee.amount}</p>
              {fee.description && (
                <p className='absolute -bottom-5 text-xs'> {fee.description}</p>
              )}
            </div>
          ))}

          {additionalFees.length > 0 && (
            <div className='bg-gray-800 p-4 rounded-xl font-medium mt-8'>
              <p>Bank: {additionalFees[0].bank}</p>
              <p>Account No: {additionalFees[0].accountNumber}</p>
              <p>Account Name: {additionalFees[0].accountName}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdditionalFeesContainer;
