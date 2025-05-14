"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { Minus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Input } from "../ui/input";

type PaymentProps = {
  id: Id<"extraFeesAccount">;
  bank: string;
  accountNo: string;
  accountNam: string;
};

const UpdateExtraFeesAccount = ({
  id,
  bank,
  accountNo,
  accountNam,
}: PaymentProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [bankName, setBankName] = useState(bank);
  const [accountNumber, setAccountNumber] = useState(accountNo);
  const [accountName, setAccountName] = useState(accountNam);

  const updateData = useMutation(api.fees.updateExtraFeesAccount);

  useEffect(() => {
    if (open) {
      setBankName(bank);
      setAccountNumber(accountNo);
      setAccountName(accountNam);
    }
  }, [open, bank, accountNo, accountNam]);

  const handleUpdate = async () => {
  
    setLoading(true);

    try {
      await updateData({
        id,
        bankName,
        accountNumber,
        accountName,
      });

      toast.success("Success!", {
        description: "Updated account details successfully.",
      });
    } catch (error) {
      console.log("Error Msg: ", error);
      toast.error("Error!", {
        description: "Failed to update account details",
      });
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant='outline'>Update</Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Update Fee</DialogTitle>
        </DialogHeader>

        <div className='space-y-3'>
          <div className='space-y-1'>
            <label className='text-sm text-muted-foreground'>Bank Name</label>
            <Input
              placeholder='Bank name'
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
            />
          </div>

          <div className='space-y-1'>
            <label className='text-sm text-muted-foreground'>
              Account Number
            </label>
            <Input
              placeholder='Account number'
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
            />
          </div>

          <div className='space-y-1'>
            <label className='text-sm text-muted-foreground'>
              Account Name
            </label>
            <Input
              placeholder='Account name'
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
            />
          </div>
          <div className='pt-5'>
            <Button onClick={handleUpdate} className='w-full'>
              {loading ? <Minus className='animate-spin' /> : "Update"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateExtraFeesAccount;
