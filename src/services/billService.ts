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
  deleteField,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { subscribeQuery } from "@/lib/firestoreSubscribe";
import { RecurringBill } from "@/types";

function recurringBillsQuery(householdId: string) {
  return query(
    collection(db, `households/${householdId}/recurringBills`),
    orderBy("dueDay", "asc")
  );
}

export function subscribeRecurringBills(
  householdId: string,
  onData: (bills: RecurringBill[]) => void
) {
  return subscribeQuery<RecurringBill>(recurringBillsQuery(householdId), onData, "tagihan");
}

export async function getRecurringBills(householdId: string): Promise<RecurringBill[]> {
  const snapshot = await getDocs(recurringBillsQuery(householdId));
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
  const billRef = doc(db, `households/${householdId}/recurringBills/${billId}`);
  const walletRef = doc(db, `households/${householdId}/wallets/${walletId}`);
  const txRef = doc(collection(db, `households/${householdId}/transactions`));

  await runTransaction(db, async (t) => {
    // Firestore transactions require all reads before any writes
    const billSnap = await t.get(billRef);
    if (!billSnap.exists()) throw new Error("Tagihan tidak ditemukan");
    const walletSnap = await t.get(walletRef);

    const billData = billSnap.data() as RecurringBill;
    if (billData.paidMonths?.[monthKey]) throw new Error("Tagihan bulan ini sudah lunas");

    // 1. Create Transaction doc
    t.set(txRef, {
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
    });

    // 2. Deduct Wallet Balance
    if (walletSnap.exists()) {
      t.update(walletRef, {
        currentBalance: (walletSnap.data().currentBalance || 0) - amount,
        updatedAt: serverTimestamp(),
      });
    }

    // 3. Mark Bill as Paid for this month
    t.update(billRef, {
      [`paidMonths.${monthKey}`]: {
        paidAt: Timestamp.now(),
        transactionId: txRef.id,
        paidAmount: amount,
      },
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

  await runTransaction(db, async (t) => {
    const billSnap = await t.get(billRef);
    if (!billSnap.exists()) throw new Error("Tagihan tidak ditemukan");

    const paidInfo = (billSnap.data() as RecurringBill).paidMonths?.[monthKey];
    if (!paidInfo) return;

    // Read the payment transaction and its wallet so the payment can be reverted.
    // If the transaction was already deleted from the transaction list, its
    // wallet balance was restored then, so only the paid mark is removed.
    const txRef = paidInfo.transactionId
      ? doc(db, `households/${householdId}/transactions/${paidInfo.transactionId}`)
      : null;
    const txSnap = txRef ? await t.get(txRef) : null;
    const txData = txSnap?.exists() ? txSnap.data() : null;
    const walletRef = txData?.walletId
      ? doc(db, `households/${householdId}/wallets/${txData.walletId}`)
      : null;
    const walletSnap = walletRef ? await t.get(walletRef) : null;

    if (txRef && txData) {
      t.delete(txRef);
      if (walletRef && walletSnap?.exists()) {
        t.update(walletRef, {
          currentBalance: (walletSnap.data().currentBalance || 0) + Number(txData.amount || 0),
          updatedAt: serverTimestamp(),
        });
      }
    }

    t.update(billRef, {
      [`paidMonths.${monthKey}`]: deleteField(),
      updatedAt: serverTimestamp(),
    });
  });
}

export async function deleteRecurringBill(
  householdId: string,
  billId: string
): Promise<void> {
  const billRef = doc(db, `households/${householdId}/recurringBills/${billId}`);
  await deleteDoc(billRef);
}

