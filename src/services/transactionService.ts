import {
  collection,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  runTransaction,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { subscribeQuery } from "@/lib/firestoreSubscribe";
import { Transaction } from "@/types";

export interface CreateTransactionDTO {
  type: "income" | "expense" | "transfer";
  amount: number;
  walletId: string;
  destinationWalletId?: string;
  categoryId?: string;
  transactionDate: Date;
  notes: string;
  createdById: string;
  creatorName?: string;
}

export async function recordTransaction(
  householdId: string,
  data: CreateTransactionDTO
): Promise<string> {
  if (data.amount <= 0) {
    throw new Error("Nominal transaksi harus lebih besar dari 0");
  }

  const txRef = doc(collection(db, `households/${householdId}/transactions`));
  const sourceWalletRef = doc(db, `households/${householdId}/wallets/${data.walletId}`);
  const destWalletRef = data.destinationWalletId
    ? doc(db, `households/${householdId}/wallets/${data.destinationWalletId}`)
    : null;

  await runTransaction(db, async (t) => {
    // 1. Read source wallet
    const sourceDoc = await t.get(sourceWalletRef);
    if (!sourceDoc.exists()) {
      throw new Error("Dompet asal tidak ditemukan");
    }
    const currentSourceBal = Number(sourceDoc.data().currentBalance || 0);

    // 2. Read destination wallet if transfer
    let destDoc = null;
    let currentDestBal = 0;
    if (data.type === "transfer" && destWalletRef) {
      if (data.walletId === data.destinationWalletId) {
        throw new Error("Dompet asal dan dompet tujuan tidak boleh sama");
      }
      destDoc = await t.get(destWalletRef);
      if (!destDoc.exists()) {
        throw new Error("Dompet tujuan tidak ditemukan");
      }
      currentDestBal = Number(destDoc.data().currentBalance || 0);
    }

    // 3. Calculate new balances
    let newSourceBal = currentSourceBal;
    if (data.type === "expense") {
      newSourceBal = currentSourceBal - data.amount;
    } else if (data.type === "income") {
      newSourceBal = currentSourceBal + data.amount;
    } else if (data.type === "transfer") {
      newSourceBal = currentSourceBal - data.amount;
    }

    // 4. Update source wallet
    t.update(sourceWalletRef, {
      currentBalance: newSourceBal,
      updatedAt: serverTimestamp(),
    });

    // 5. Update destination wallet if transfer
    if (data.type === "transfer" && destWalletRef) {
      const newDestBal = currentDestBal + data.amount;
      t.update(destWalletRef, {
        currentBalance: newDestBal,
        updatedAt: serverTimestamp(),
      });
    }

    // 6. Write transaction document (preventing undefined field error)
    const txPayload: Record<string, any> = {
      id: txRef.id,
      type: data.type,
      amount: data.amount,
      walletId: data.walletId,
      transactionDate: Timestamp.fromDate(data.transactionDate),
      notes: data.notes || "",
      createdById: data.createdById,
      creatorName: data.creatorName || "",
      createdAt: serverTimestamp(),
    };

    if (data.type === "transfer" && data.destinationWalletId) {
      txPayload.destinationWalletId = data.destinationWalletId;
    }

    if (data.type !== "transfer" && data.categoryId) {
      txPayload.categoryId = data.categoryId;
    }

    t.set(txRef, txPayload);
  });

  return txRef.id;
}

export async function deleteTransaction(
  householdId: string,
  transaction: Transaction
): Promise<void> {
  const txRef = doc(db, `households/${householdId}/transactions/${transaction.id}`);
  const sourceWalletRef = doc(db, `households/${householdId}/wallets/${transaction.walletId}`);
  const destWalletRef = transaction.destinationWalletId
    ? doc(db, `households/${householdId}/wallets/${transaction.destinationWalletId}`)
    : null;

  await runTransaction(db, async (t) => {
    // Firestore transactions require all reads before any writes
    const sourceDoc = await t.get(sourceWalletRef);
    const destDoc =
      transaction.type === "transfer" && destWalletRef ? await t.get(destWalletRef) : null;

    // 1. Revert source wallet
    if (sourceDoc.exists()) {
      const currentSourceBal = Number(sourceDoc.data().currentBalance || 0);
      const revertedSourceBal =
        transaction.type === "income"
          ? currentSourceBal - transaction.amount
          : currentSourceBal + transaction.amount;

      t.update(sourceWalletRef, {
        currentBalance: revertedSourceBal,
        updatedAt: serverTimestamp(),
      });
    }

    // 2. Revert destination wallet if transfer
    if (destWalletRef && destDoc?.exists()) {
      const currentDestBal = Number(destDoc.data().currentBalance || 0);
      t.update(destWalletRef, {
        currentBalance: currentDestBal - transaction.amount,
        updatedAt: serverTimestamp(),
      });
    }

    // 3. Delete transaction
    t.delete(txRef);
  });
}

export async function getRecentTransactions(
  householdId: string,
  maxItems = 10
): Promise<Transaction[]> {
  const txRef = collection(db, `households/${householdId}/transactions`);
  const q = query(txRef, orderBy("transactionDate", "desc"), limit(maxItems));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Transaction));
}

function monthTransactionsQuery(householdId: string, year: number, month: number) {
  const startDate = new Date(year, month - 1, 1, 0, 0, 0, 0);
  const endDate = new Date(year, month, 0, 23, 59, 59, 999);

  return query(
    collection(db, `households/${householdId}/transactions`),
    where("transactionDate", ">=", Timestamp.fromDate(startDate)),
    where("transactionDate", "<=", Timestamp.fromDate(endDate)),
    orderBy("transactionDate", "desc")
  );
}

export function subscribeMonthTransactions(
  householdId: string,
  year: number,
  month: number, // 1-12
  onData: (transactions: Transaction[]) => void
) {
  return subscribeQuery<Transaction>(
    monthTransactionsQuery(householdId, year, month),
    onData,
    "transaksi"
  );
}

export async function getMonthTransactions(
  householdId: string,
  year: number,
  month: number // 1-12
): Promise<Transaction[]> {
  const snapshot = await getDocs(monthTransactionsQuery(householdId, year, month));
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Transaction));
}

