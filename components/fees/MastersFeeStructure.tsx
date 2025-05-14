"use client";

import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { Minus } from "lucide-react";
import UpdateMatersFee from "./UpdateMastersFee";

export default function MastersFeeStructure() {
  const mastersFees = useQuery(api.fees.getMastersFees);

  return (
    <div>
      <h1 className='text-xl font-semibold'>Master&apos;s Fee Structure</h1>
      {mastersFees === undefined ? (
        <div className='flex items-center py-6 text-muted-foreground'>
          <Minus className='animate-spin mr-3' /> Loading PGD fee structure
        </div>
      ) : mastersFees.length === 0 ? (
        <p className='py-5 text-muted-foreground'>
          No fee structure found at the moment
        </p>
      ) : (
        <div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 pb-8 pt-4'>
          {mastersFees.map((fee) => (
            <div
              key={fee._id}
              className='bg-white dark:bg-gray-900 rounded-xl p-5 space-y-3 shadow-md'>
              <div className='flex items-center justify-between'>
                <h1 className='text-lg font-medium'>
                  {fee.title}: {fee.amount}
                  {fee.description && (
                    <span className='text-muted-foreground text-sm ml-2'>
                      ({fee.description})
                    </span>
                  )}
                </h1>
                     
                      <UpdateMatersFee fee={fee} />
              </div>

              <div className='flex flex-col gap-1 font-medium text-sm'>
                {fee.details.map((detail, index) => (
                  <div
                    key={`${fee._id}-${index}`}
                    className='font-medium bg-blue-500/10 dark:bg-gray-800 px-4 py-3 rounded-xl'>
                    <p>
                      Bank:{" "}
                      <span className='text-muted-foreground'>
                        {detail.bank}
                      </span>
                    </p>
                    <p>
                      Account No:{" "}
                      <span className='text-muted-foreground'>
                        {detail.accountNumber}
                      </span>
                    </p>
                    <p>
                      Account Name:{" "}
                      <span className='text-muted-foreground'>
                        {detail.accountName}
                      </span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
