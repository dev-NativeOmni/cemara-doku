import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  runTransaction,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { RecurringBill } from "@/types";

export async function getRecurringBills(householdId: string): Promise<RecurringBill[]> {
  const billsRef = collection(db, `households/${householdId}/recurringBills`);
  const q = query(billsRef, orderBy("dueDay", "asc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as RecurringBill));
}

export async function createRecurringBill(
  householdId: string,
  bill: Omit<RecurringBill, "id" | "createdAt" | "updatedAt">
): Promise<RecurringBill> {
  const billsRef = collection(db, `households/${householdId}/recurringBills`);
  const newDocRef = doc(billsRef);

  const payload: any = {
    id: newDocRef.id,
    title: bill.title,
    amount: bill.amount,
    dueDay: bill.dueDay || 1,
    frequency: bill.frequency || "monthly",
    icon: bill.icon || "Calendar",
    color: bill.color || "#10B981",
    paidMonths: bill.paidMonths || {},
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  if (bill.categoryId) payload.categoryId = bill.categoryId;
  if (bill.walletId) payload.walletId = bill.walletId;
  if (bill.notes) payload.notes = bill.notes;

  await setDoc(newDocRef, payload);
  return { id: newDocRef.id, ...payload };
}

export async function updateRecurringBill(
  householdId: string,
  billId: string,
  data: Partial<RecurringBill>
): Promise<void> {
  const billRef = doc(db, `households/${householdId}/recurringBills/${billId}`);
  const payload: any = {
    ...data,
    updatedAt: serverTimestamp(),
  };

  Object.keys(payload).forEach((key) => payload[key] === undefined && delete payload[key]);
  await updateDoc(billRef, payload);
}

export async function payRecurringBill(
  householdId: string,
  billId: string,
  year: number,
  month: number,
  walletId: string,
  amount: number,
  createdById: string,
  creatorName?: string
): Promise<void> {
  const monthKey = `${year}-${String(month).padStart(2, "0")}`;

  await runTransaction(db, async (t) => {
    const billRef = doc(db, `households/${householdId}/recurringBills/${billId}`);
    const billSnap = await t.get(billRef);
    if (!billSnap.exists()) throw new Error("Tagihan tidak ditemukan");

    const billData = billSnap.data() as RecurringBill;

    // 1. Create Transaction doc
    const txRef = doc(collection(db, `households/${householdId}/transactions`));
    const txData = {
      id: txRef.id,
      type: "expense",
      amount: amount,
      walletId: walletId,
      categoryId: billData.categoryId || null,
      transactionDate: Timestamp.now(),
      notes: `Pembayaran Tagihan: ${billData.title}`,
      createdById: createdById,
      creatorName: creatorName || "Anggota",
      createdAt: serverTimestamp(),
    };
    t.set(txRef, txData);

    // 2. Deduct Wallet Balance
    const walletRef = doc(db, `households/${householdId}/wallets/${walletId}`);
    const walletSnap = await t.get(walletRef);
    if (walletSnap.exists()) {
      const walletData = walletSnap.data();
      const newBal = (walletData.currentBalance || 0) - amount;
      t.update(walletRef, {
        currentBalance: newBal,
        updatedAt: serverTimestamp(),
      });
    }

    // 3. Mark Bill as Paid for this month
    const existingPaid = billData.paidMonths || {};
    existingPaid[monthKey] = {
      paidAt: Timestamp.now(),
      transactionId: txRef.id,
      paidAmount: amount,
    };

    t.update(billRef, {
      paidMonths: existingPaid,
      updatedAt: serverTimestamp(),
    });
  });
}

export async function unpayRecurringBill(
  householdId: string,
  billId: string,
  year: number,
  month: number
): Promise<void> {
  const monthKey = `${year}-${String(month).padStart(2, "0")}`;
  const billRef = doc(db, `households/${householdId}/recurringBills/${billId}`);
  const billSnap = await getDocs(query(collection(db, `households/${householdId}/recurringBills`)));
  const targetDoc = billSnap.docs.find((d) => d.id === billId);

  if (targetDoc) {
    const billData = targetDoc.data() as RecurringBill;
    const existingPaid = { ...(billData.paidMonths || {}) };
    delete existingPaid[monthKey];

    await updateDoc(billRef, {
      paidMonths: existingPaid,
      updatedAt: serverTimestamp(),
    });
  }
}

export async function deleteRecurringBill(
  householdId: string,
  billId: string
): Promise<void> {
  const billRef = doc(db, `households/${householdId}/recurringBills/${billId}`);
  await deleteDoc(billRef);
}
