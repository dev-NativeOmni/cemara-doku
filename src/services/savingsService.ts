import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  runTransaction,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { subscribeQuery } from "@/lib/firestoreSubscribe";
import { SavingsGoal } from "@/types";

function savingsGoalsQuery(householdId: string) {
  return query(
    collection(db, `households/${householdId}/savingsGoals`),
    orderBy("createdAt", "desc")
  );
}

export function subscribeSavingsGoals(householdId: string, onData: (goals: SavingsGoal[]) => void) {
  return subscribeQuery<SavingsGoal>(savingsGoalsQuery(householdId), onData, "target tabungan");
}

export async function getSavingsGoals(householdId: string): Promise<SavingsGoal[]> {
  const snapshot = await getDocs(savingsGoalsQuery(householdId));
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as SavingsGoal));
}

export async function createSavingsGoal(
  householdId: string,
  goal: Omit<SavingsGoal, "id" | "createdAt" | "updatedAt">
): Promise<SavingsGoal> {
  const goalsRef = collection(db, `households/${householdId}/savingsGoals`);
  const newDocRef = doc(goalsRef);

  const payload: any = {
    id: newDocRef.id,
    title: goal.title,
    targetAmount: goal.targetAmount,
    currentAmount: goal.currentAmount || 0,
    icon: goal.icon || "Target",
    color: goal.color || "#10B981",
    isCompleted: (goal.currentAmount || 0) >= goal.targetAmount,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  if (goal.targetDate) payload.targetDate = goal.targetDate;
  if (goal.walletId) payload.walletId = goal.walletId;
  if (goal.notes) payload.notes = goal.notes;

  await setDoc(newDocRef, payload);
  return { id: newDocRef.id, ...payload };
}

export async function updateSavingsGoal(
  householdId: string,
  goalId: string,
  data: Partial<SavingsGoal>
): Promise<void> {
  const goalRef = doc(db, `households/${householdId}/savingsGoals/${goalId}`);
  const payload: any = {
    ...data,
    updatedAt: serverTimestamp(),
  };

  if (data.targetAmount !== undefined && data.currentAmount !== undefined) {
    payload.isCompleted = data.currentAmount >= data.targetAmount;
  }

  // Remove undefined fields
  Object.keys(payload).forEach((key) => payload[key] === undefined && delete payload[key]);

  await updateDoc(goalRef, payload);
}

export async function depositToSavingsGoal(
  householdId: string,
  goalId: string,
  amount: number,
  walletId?: string,
  createdById?: string,
  creatorName?: string
): Promise<void> {
  await runTransaction(db, async (t) => {
    const goalRef = doc(db, `households/${householdId}/savingsGoals/${goalId}`);
    const goalSnap = await t.get(goalRef);
    if (!goalSnap.exists()) throw new Error("Target tabungan tidak ditemukan");

    const goalData = goalSnap.data() as SavingsGoal;
    const newAmount = (goalData.currentAmount || 0) + amount;
    const isCompleted = newAmount >= goalData.targetAmount;

    // Deduct from wallet if walletId is provided
    if (walletId) {
      const walletRef = doc(db, `households/${householdId}/wallets/${walletId}`);
      const walletSnap = await t.get(walletRef);
      if (walletSnap.exists()) {
        const walletData = walletSnap.data();
        const newWalletBal = (walletData.currentBalance || 0) - amount;
        t.update(walletRef, {
          currentBalance: newWalletBal,
          updatedAt: serverTimestamp(),
        });
      }
    }

    t.update(goalRef, {
      currentAmount: newAmount,
      isCompleted,
      updatedAt: serverTimestamp(),
    });
  });
}

export async function deleteSavingsGoal(
  householdId: string,
  goalId: string
): Promise<void> {
  const goalRef = doc(db, `households/${householdId}/savingsGoals/${goalId}`);
  await deleteDoc(goalRef);
}

