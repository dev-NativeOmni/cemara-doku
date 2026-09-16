import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  serverTimestamp,
  writeBatch,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Wallet } from "@/types";

export const DEFAULT_WALLETS: Omit<Wallet, "id">[] = [
  {
    name: "Kas Tunai",
    type: "cash",
    currentBalance: 0,
    color: "#10B981",
    icon: "Wallet",
    isArchived: false,
  },
  {
    name: "BCA Operasional",
    type: "bank",
    currentBalance: 0,
    color: "#2563EB",
    icon: "Landmark",
    isArchived: false,
  },
  {
    name: "GoPay / E-Wallet",
    type: "ewallet",
    currentBalance: 0,
    color: "#0EA5E9",
    icon: "Smartphone",
    isArchived: false,
  },
  {
    name: "Tabungan & Dana Darurat",
    type: "savings",
    currentBalance: 0,
    color: "#8B5CF6",
    icon: "PiggyBank",
    isArchived: false,
  },
];

export async function seedDefaultWallets(householdId: string): Promise<void> {
  const batch = writeBatch(db);
  const walletsRef = collection(db, `households/${householdId}/wallets`);
  
  for (const wallet of DEFAULT_WALLETS) {
    const newDoc = doc(walletsRef);
    batch.set(newDoc, {
      ...wallet,
      id: newDoc.id,
      updatedAt: serverTimestamp(),
    });
  }
  
  await batch.commit();
}

export async function getWallets(householdId: string, includeArchived = false): Promise<Wallet[]> {
  const walletsRef = collection(db, `households/${householdId}/wallets`);
  const q = includeArchived
    ? query(walletsRef)
    : query(walletsRef, where("isArchived", "==", false));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Wallet));
}

export async function createWallet(
  householdId: string,
  wallet: Omit<Wallet, "id" | "updatedAt">
): Promise<string> {
  const walletsRef = collection(db, `households/${householdId}/wallets`);
  const newDoc = doc(walletsRef);
  await setDoc(newDoc, {
    ...wallet,
    id: newDoc.id,
    updatedAt: serverTimestamp(),
  });
  return newDoc.id;
}

export async function updateWallet(
  householdId: string,
  walletId: string,
  data: Partial<Wallet>
): Promise<void> {
  const walletRef = doc(db, `households/${householdId}/wallets/${walletId}`);
  await updateDoc(walletRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function archiveWallet(householdId: string, walletId: string, isArchived = true): Promise<void> {
  const walletRef = doc(db, `households/${householdId}/wallets/${walletId}`);
  await updateDoc(walletRef, {
    isArchived,
    updatedAt: serverTimestamp(),
  });
}

