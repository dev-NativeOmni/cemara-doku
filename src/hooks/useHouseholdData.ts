"use client";

import { useEffect, useState } from "react";
import { subscribeWallets } from "@/services/walletService";
import { subscribeCategories } from "@/services/categoryService";
import { subscribeMonthTransactions } from "@/services/transactionService";
import { subscribeBudgets } from "@/services/budgetService";
import { subscribeSavingsGoals } from "@/services/savingsService";
import { subscribeRecurringBills } from "@/services/billService";
import { subscribeShoppingItems } from "@/services/shoppingService";
import { getHouseholdMembers } from "@/services/authService";
import {
  Budget,
  Category,
  RecurringBill,
  SavingsGoal,
  ShoppingItem,
  Transaction,
  UserProfile,
  Wallet,
} from "@/types";

// Realtime household data. Month-independent collections are subscribed once per
// household; transactions and budgets re-subscribe only when the month changes.
// Writes from any family member show up without manual reloads.
export function useHouseholdData(
  householdId: string | undefined,
  memberUids: string[] | undefined,
  month: number,
  year: number
) {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [recurringBills, setRecurringBills] = useState<RecurringBill[]>([]);
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([]);
  const [householdMembers, setHouseholdMembers] = useState<UserProfile[]>([]);

  useEffect(() => {
    if (!householdId) return;
    const unsubscribers = [
      subscribeWallets(householdId, setWallets),
      subscribeCategories(householdId, setCategories),
      subscribeSavingsGoals(householdId, setSavingsGoals),
      subscribeRecurringBills(householdId, setRecurringBills),
      subscribeShoppingItems(householdId, setShoppingItems),
    ];
    return () => unsubscribers.forEach((unsub) => unsub());
  }, [householdId]);

  useEffect(() => {
    if (!householdId) return;
    const unsubscribers = [
      subscribeMonthTransactions(householdId, year, month, setTransactions),
      subscribeBudgets(householdId, month, year, setBudgets),
    ];
    return () => unsubscribers.forEach((unsub) => unsub());
  }, [householdId, month, year]);

  const memberKey = memberUids?.join(",") ?? "";
  useEffect(() => {
    if (!memberKey) return;
    let cancelled = false;
    getHouseholdMembers(memberKey.split(","))
      .then((members) => {
        if (!cancelled) setHouseholdMembers(members);
      })
      .catch((err) => console.error("Gagal memuat anggota keluarga:", err));
    return () => {
      cancelled = true;
    };
  }, [memberKey]);

  return {
    wallets,
    categories,
    transactions,
    budgets,
    savingsGoals,
    recurringBills,
    shoppingItems,
    householdMembers,
  };
}
