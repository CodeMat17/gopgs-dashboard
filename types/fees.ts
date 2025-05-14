// types/fees.ts
import { Id } from "@/convex/_generated/dataModel";

export interface FeeDetail {
  bank: string;
  accountNumber: string;
  accountName: string;
}

export interface FeeData {
  _id: Id<"pgdFees"> | Id<"mastersFees">;
  title: string;
  amount: string;
  description?: string;
  details: FeeDetail[];
}

export type FeeType = "pgd" | "masters";
