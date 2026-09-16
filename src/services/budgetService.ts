import {
  collection,
  doc,
  getDocs,
  setDoc,
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

