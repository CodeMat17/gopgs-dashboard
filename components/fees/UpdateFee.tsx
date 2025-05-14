// UpdateFee.tsx
"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { Minus, Wrench, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface FeeData {
  _id: Id<"pgdFees">;
  title: string;
  amount: string;
  description?: string;
  details: {
    bank: string;
    accountNumber: string;
    accountName: string;
  }[];
}

interface UpdateFeeProps {
  fee: FeeData;
}

export default function UpdateFee({ fee }: UpdateFeeProps) {
  const [open, setOpen] = useState(false);
  const updateFee = useMutation(api.fees.updatePgdFee);
  const [formData, setFormData] = useState<FeeData>(fee);

  const [displayAmount, setDisplayAmount] = useState<string>(() => {
    // Initialize displayAmount with formatted value
    const num = fee.amount.replace(/\D/g, "");
    return num ? new Intl.NumberFormat("en-NG").format(Number(num)) : "";
  });

  const [isUpdating, setIsUpdating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    try {

      const numericValue = formData.amount.replace(/\D/g, "");
      const formattedAmount = `₦${new Intl.NumberFormat("en-NG").format(Number(numericValue))}`;

      await updateFee({
        id: formData._id,
        title: formData.title,
        amount: formattedAmount,
        description: formData.description,
        details: formData.details,
      });
      toast.success("Fee updated successfully");
      setOpen(false);
    } catch (error) {
      toast.error("Failed to update fee");
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {

    const numericValue = e.target.value.replace(/\D/g, "");


    const formattedValue = numericValue
      ? new Intl.NumberFormat("en-NG").format(Number(numericValue))
      : "";

    setFormData({ ...formData, amount: numericValue });

    setDisplayAmount(formattedValue);

  };

  const handleDetailChange = (index: number, field: string, value: string) => {
    const newDetails = [...formData.details];
    newDetails[index] = { ...newDetails[index], [field]: value };
    setFormData({ ...formData, details: newDetails });
  };

  const addBankAccount = () => {
    setFormData({
      ...formData,
      details: [
        ...formData.details,
        {
          bank: "",
          accountNumber: "",
          accountName: "",
        },
      ],
    });
  };

  const removeBankAccount = (index: number) => {
    const newDetails = [...formData.details];
    newDetails.splice(index, 1);
    setFormData({
      ...formData,
      details: newDetails,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size='icon' variant='outline'>
          <Wrench />
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Update Fee</DialogTitle>
        </DialogHeader>

        <div className='max-h-[calc(100vh-12rem)] pb-4 overflow-y-scroll flex-1'>
          <form onSubmit={handleSubmit} className='space-y-3'>
            <div className='flex flex-col sm:flex-row gap-3'>
              <div className='w-full space-y-1'>
                <label className='text-sm text-muted-foreground'>Title</label>
                <Input
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </div>
              <div className='w-full space-y-1'>
                <label className='text-sm text-muted-foreground'>Amount</label>
                <div className='relative'>
                  <span className='absolute left-3 top-2 text-sm'>₦</span>
                  <Input
                    placeholder='Enter amount'
                    className='pl-8'
                    value={displayAmount}
                    onChange={handleAmountChange}
                  />
                </div>
              </div>
            </div>

            <div className='space-y-1'>
              <label className='text-sm text-muted-foreground'>
                Description (optional)
              </label>
              <Input
                value={formData.description || ""}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            <div className='space-y-2'>
              <div className='flex justify-between items-center'>
                <label className='text-sm text-muted-foreground'>
                  Bank/Account Details
                </label>
                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  onClick={addBankAccount}>
                  Add Bank Account
                </Button>
              </div>
              {formData.details.map((detail, index) => (
                <div
                  key={index}
                  className='space-y-2 border p-2 rounded relative'>
                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    className='absolute top-1 right-1 p-1 h-6 w-6'
                    onClick={() => removeBankAccount(index)}>
                    <X className='text-red-500' />
                  </Button>
                  <Input
                    placeholder='Bank Name'
                    value={detail.bank}
                    onChange={(e) =>
                      handleDetailChange(index, "bank", e.target.value)
                    }
                  />
                  <Input
                    placeholder='Account Number'
                    value={detail.accountNumber}
                    onChange={(e) =>
                      handleDetailChange(index, "accountNumber", e.target.value)
                    }
                  />
                  <Input
                    placeholder='Account Name'
                    value={detail.accountName}
                    onChange={(e) =>
                      handleDetailChange(index, "accountName", e.target.value)
                    }
                  />
                </div>
              ))}
            </div>

            <div className='flex justify-end space-x-2 pt-4'>
              <Button
                variant='outline'
                type='button'
                onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type='submit'>
                {isUpdating ? <Minus className='animate-spin' /> : "Update"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
