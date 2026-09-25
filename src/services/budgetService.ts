import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { subscribeQuery } from "@/lib/firestoreSubscribe";
import { Budget } from "@/types";

function budgetsQuery(householdId: string, month: number, year: number) {
  return query(
    collection(db, `households/${householdId}/budgets`),
    where("month", "==", month),
    where("year", "==", year)
  );
}

export function subscribeBudgets(
  householdId: string,
  month: number,
  year: number,
  onData: (budgets: Budget[]) => void
) {
  return subscribeQuery<Budget>(budgetsQuery(householdId, month, year), onData, "anggaran");
}

export async function getBudgets(
  householdId: string,
  month: number,
  year: number
): Promise<Budget[]> {
  const snapshot = await getDocs(budgetsQuery(householdId, month, year));
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

  const prevBudgets = (await getBudgets(householdId, prevMonth, prevYear)).filter(
    (b) => b.limitAmount > 0
  );
  if (prevBudgets.length === 0) return 0;

  const batch = writeBatch(db);
  for (const b of prevBudgets) {
    const budgetDocId = `${currentYear}_${currentMonth}_${b.categoryId}`;
    batch.set(
      doc(db, `households/${householdId}/budgets/${budgetDocId}`),
      {
        id: budgetDocId,
        categoryId: b.categoryId,
        month: currentMonth,
        year: currentYear,
        limitAmount: b.limitAmount,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  }
  await batch.commit();

  return prevBudgets.length;
}
