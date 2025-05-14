"use client";

import ExtraFees from "@/components/fees/ExtraFees";
import MastersFeeStructure from "@/components/fees/MastersFeeStructure";
import PgdFeeStructure from "@/components/fees/PgdFeeStructure";
import PhdEduFeeStructure from "@/components/fees/PhdEduFeeStructure";
import PhdGeneralFeeStructure from "@/components/fees/PhdGeneralFeeStructure";
import PhdNatSciFeeStructure from "@/components/fees/PhdNatSciFeeStructure";

export default function FeePage() {
  return (
    <div className='px-4 py-8'>
      <h1 className='text-2xl font-bold'>Fee Structure Management</h1>
      <div className='mt-6'>
        <PgdFeeStructure />
        <MastersFeeStructure />
        <div className='space-y-4'>
          <h1 className='text-xl font-semibold'>PhD Fee Structure</h1>

          <PhdGeneralFeeStructure />
          <PhdNatSciFeeStructure />
          <PhdEduFeeStructure />
        </div>
        <ExtraFees />
      </div>
    </div>
  );
}
