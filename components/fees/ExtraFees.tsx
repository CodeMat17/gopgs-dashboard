"use client";

import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { Loader2 } from "lucide-react";
import { Card } from "../ui/card";
import UpdateExtraFeesAccount from "./UpdateExtraFeesAccount";
import UpdateAdditionalFees from "./UpdateAdditionalFees";

export default function ExtraFeesPage() {
  const paymentAccount = useQuery(api.fees.getExtraFeesAccount);
  const extraFees = useQuery(api.fees.getExtraFees);

  if (extraFees === undefined || paymentAccount === undefined) {
    return (
      <div className='flex items-center justify-center h-64'>
        <Loader2 className='h-8 w-8 animate-spin' />
      </div>
    );
  }

  return (
    <div className=' py-6'>
      <div className='mb-6'>
        <h1 className='text-2xl font-bold'>Additional Fees</h1>
      </div>

      {/* Fees List */}
      <Card className='p-4 sm:p-5 dark:bg-gray-900 lg:grid lg:grid-cols-2 lg:gap-20'>
        <div>
          {extraFees.length === 0 ? (
            <div className='col-span-full text-center py-12'>
              <p className='text-muted-foreground'>
                No additional fees configured
              </p>
            </div>
          ) : (
             
            extraFees.map((fee, index) => (
              <div key={fee._id} className=''>
                <div className="flex items-center gap-2">
                  <div
                  className={`px-3 py-1 w-full ${index % 2 === 0 ? "bg-blue-100 dark:bg-gray-700 rounded-full" : ""}`}>
                  <div className='flex items-start justify-between'>
                    <h3 className=''>{fee.feeType}</h3>

                    <p className=''>{fee.amount}</p>
                  </div>
                  </div>
               <UpdateAdditionalFees id={fee._id} type={fee.feeType} amt={fee.amount} />
                </div>
                

                {fee.carryoverNote && (
                  <div className=' pt-1 pl-4 text-blue-700'>
                    <div className='flex items-center text-sm'>
                      <span>{fee.carryoverNote}</span>
                    </div>
                  </div>
                )}
              </div>
              //  <UpdateAdditionalFees />
            ))
          )}

          
        </div>

        {paymentAccount && (
          <div className='grid grid-cols-1 gap-2 mt-6 lg:mt-0'>
            <div>
              <p className='text-sm text-muted-foreground'>Bank Name</p>
              <p className='font-medium'>{paymentAccount.bankName}</p>
            </div>
            <div>
              <p className='text-sm text-muted-foreground'>Account Number</p>
              <p className='font-medium'>{paymentAccount.accountNumber}</p>
            </div>
            <div>
              <p className='text-sm text-muted-foreground'>Account Name</p>
              <p className='font-medium'>{paymentAccount.accountName}</p>
            </div>
            <UpdateExtraFeesAccount
              id={paymentAccount._id}
              bank={paymentAccount.bankName}
              accountNo={paymentAccount.accountNumber}
              accountNam={paymentAccount.accountName}
            />
          </div>
        )}
      </Card>
    </div>
  );
}
