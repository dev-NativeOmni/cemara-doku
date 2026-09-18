import { Timestamp } from "firebase/firestore";

export type WalletType = "bank" | "cash" | "ewallet" | "savings" | "investment";

export type TransactionType = "income" | "expense" | "transfer";

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  avatar?: string;
  householdId: string;
  role: "owner" | "member";
  createdAt?: Timestamp | Date;
}

export interface Household {
  id: string;
  name: string;
  currency: string;
  memberUids: string[];
  inviteCode: string;
  createdAt?: Timestamp | Date;
  updatedAt?: Timestamp | Date;
}

export interface Wallet {
  id: string;
  name: string;
  type: WalletType;
  currentBalance: number;
  color: string;
  icon: string;
  isArchived: boolean;
  updatedAt?: Timestamp | Date;
}

export interface Category {
  id: string;
  name: string;
  type: "income" | "expense";
  icon: string;
  color: string;
  isDefault: boolean;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  walletId: string;
  destinationWalletId?: string;
  categoryId?: string;
  transactionDate: Timestamp | Date;
  notes: string;
  createdById: string;
  creatorName?: string;
  createdAt?: Timestamp | Date;
}

export interface Budget {
  id: string;
  categoryId: string;
  month: number; // 1 - 12
  year: number;  // e.g. 2026
  limitAmount: number;
  updatedAt?: Timestamp | Date;
}

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  targetDate?: string; // YYYY-MM-DD
  icon: string;
  color: string;
  walletId?: string; // Associated funding wallet
  notes?: string;
  isCompleted?: boolean;
  createdAt?: Timestamp | Date;
  updatedAt?: Timestamp | Date;
}

export type NavigationTab = "home" | "transactions" | "budgets" | "wallets" | "savings" | "settings";
