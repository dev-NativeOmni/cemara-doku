import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Budget } from "@/types";

export async function getBudgets(
  householdId: string,
  month: number,
  year: number
): Promise<Budget[]> {
  const budgetsRef = collection(db, `households/${householdId}/budgets`);
  const q = query(
    budgetsRef,
    where("month", "==", month),
    where("year", "==", year)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Budget));
}

export async function setBudget(
  householdId: string,
  categoryId: string,
  month: number,
  year: number,
  limitAmount: number
): Promise<void> {
  const budgetDocId = `${year}_${month}_${categoryId}`;
  const budgetRef = doc(db, `households/${householdId}/budgets/${budgetDocId}`);

  if (limitAmount <= 0) {
    await deleteDoc(budgetRef);
    return;
  }

  await setDoc(
    budgetRef,
    {
      id: budgetDocId,
      categoryId,
      month,
      year,
      limitAmount,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function deleteBudget(
  householdId: string,
  categoryId: string,
  month: number,
  year: number
): Promise<void> {
  const budgetDocId = `${year}_${month}_${categoryId}`;
  const budgetRef = doc(db, `households/${householdId}/budgets/${budgetDocId}`);
  await deleteDoc(budgetRef);
}

export async function copyPreviousMonthBudgets(
  householdId: string,
  currentMonth: number,
  currentYear: number
): Promise<number> {
  let prevMonth = currentMonth - 1;
  let prevYear = currentYear;
  if (prevMonth === 0) {
    prevMonth = 12;
    prevYear = currentYear - 1;
  }

  const prevBudgets = await getBudgets(householdId, prevMonth, prevYear);
  if (prevBudgets.length === 0) return 0;

  for (const b of prevBudgets) {
    if (b.limitAmount > 0) {
      await setBudget(householdId, b.categoryId, currentMonth, currentYear, b.limitAmount);
    }
  }

  return prevBudgets.length;
}


