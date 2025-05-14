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
import { Minus, Wrench } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Input } from "../ui/input";
import { DialogDescription } from "@radix-ui/react-dialog";

type FeeType =
  | "Course Deferment"
  | "Development Levy"
  | "Exams Levy"
  | "Change of Supervisor"
  | "Change of Department"
  | "Utility Levy"
  | "Carryover Fee";

type PaymentProps = {
  id: Id<"extraFees">;
  type: FeeType;
  amt: string;
};

const UpdateAdditionalFees = ({
  id,
  type,
  amt,
}: PaymentProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [feeType, setFeeType] = useState(type);
  // const [amount, setAmount] = useState(amt);

  const [displayAmount, setDisplayAmount] = useState<string>(() => {
    // Initialize displayAmount with formatted value
    const num = amt.replace(/\D/g, "");
    return num ? new Intl.NumberFormat("en-NG").format(Number(num)) : "";
  });
  const [rawAmount, setRawAmount] = useState(amt);

  const updateData = useMutation(api.fees.updateExtraFees);

  useEffect(() => {
    if (open) {
      setFeeType(type);
      const num = amt.replace(/\D/g, "");
      setDisplayAmount(
        num ? new Intl.NumberFormat("en-NG").format(Number(num)) : ""
      );
      setRawAmount(amt);
    }
  }, [open, type, amt]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove all non-digit characters
    const numericValue = e.target.value.replace(/\D/g, "");

    // Format with commas for display
    const formattedValue = numericValue
      ? new Intl.NumberFormat("en-NG").format(Number(numericValue))
      : "";

    setDisplayAmount(formattedValue);
    // Store the raw numeric value for submission
    setRawAmount(numericValue);
  };

  const handleUpdate = async () => {
    
    if (!feeType || !rawAmount) {
      toast.error("Error!", {
        description: "Fee type and amount are required",
      });
      return;
    }

    setLoading(true);

    try {
      const formattedAmount = `₦${new Intl.NumberFormat("en-NG").format(Number(rawAmount))}`;


      await updateData ({
        id,
        feeType,
        amount: formattedAmount,
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
        <Button size='icon' variant='outline'>
          <Wrench />
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Update Fee</DialogTitle>
          <DialogDescription>
            Are you sure you want to update the{" "}
            <span className='font-medium'>{feeType}</span> fee?
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-3'>
          <div className='space-y-1'>
            <label className='text-sm text-muted-foreground'>{feeType}</label>
            <Input
              placeholder='Enter amount'
              value={displayAmount}
              onChange={handleAmountChange}
              onBlur={() => {
                if (displayAmount && !displayAmount.startsWith("₦")) {
                  setDisplayAmount(`₦${displayAmount}`);
                }
              }}
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

export default UpdateAdditionalFees;
