"use client";

import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { Minus } from "lucide-react";
import UpdatePhdEduFees from "./UpdatePhdEduFees";

export default function PhdEduFeeStructure() {
  const fees = useQuery(api.fees.getPhdEduFees);

  return (
    <div>
      {fees === undefined ? (
        <div className='flex items-center py-6 text-muted-foreground'>
          <Minus className='animate-spin mr-3' /> Loading fee structure
        </div>
      ) : fees.length === 0 ? (
        <p className='py-5 text-muted-foreground'>
          No fee structure found at the moment
        </p>
      ) : (
        <div className='bg-white dark:bg-gray-900 rounded-xl p-5 shadow-md'>
          <h1 className='text-muted-foreground font-semibold mb-4'>
            Faculty of Education/Arts/Mgt. Sciences (PhD)
          </h1>
          <div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4'>
            {fees.map((fee) => (
              <div
                key={fee._id}
                className='bg-blue-500/10 dark:bg-gray-800 rounded-xl p-4'>
                <div className='flex items-center justify-between text-sm'>
                  <h1 className=' font-medium'>
                    {fee.title}: {fee.amount}
                    {fee.description && (
                      <span className='text-muted-foreground text-sm ml-2'>
                        ({fee.description})
                      </span>
                    )}
                  </h1>
               <UpdatePhdEduFees fee={fee} />
                </div>

                <div className='flex flex-col gap-1 font-medium text-sm'>
                  {fee.details.map((detail, index) => (
                    <div
                      key={`${fee._id}-${index}`}
                      className='font-medium rounded-xl'>
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
        </div>
      )}
    </div>
  );
}
