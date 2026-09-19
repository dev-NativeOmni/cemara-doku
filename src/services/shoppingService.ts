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
import { ShoppingItem } from "@/types";

export async function getShoppingItems(householdId: string): Promise<ShoppingItem[]> {
  const itemsRef = collection(db, `households/${householdId}/shoppingItems`);
  const q = query(itemsRef, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as ShoppingItem));
}

export async function createShoppingItem(
  householdId: string,
  item: Omit<ShoppingItem, "id" | "createdAt" | "updatedAt">
): Promise<ShoppingItem> {
  const itemsRef = collection(db, `households/${householdId}/shoppingItems`);
  const newDocRef = doc(itemsRef);

  const payload: any = {
    id: newDocRef.id,
    name: item.name,
    isCompleted: false,
    addedById: item.addedById,
    addedByName: item.addedByName || "Anggota",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  if (item.quantity) payload.quantity = item.quantity;
  if (item.estimatedPrice) payload.estimatedPrice = item.estimatedPrice;
  if (item.actualPrice) payload.actualPrice = item.actualPrice;
  if (item.categoryId) payload.categoryId = item.categoryId;

  await setDoc(newDocRef, payload);
  return { id: newDocRef.id, ...payload };
}

export async function toggleShoppingItem(
  householdId: string,
  itemId: string,
  isCompleted: boolean,
  actualPrice?: number
): Promise<void> {
  const itemRef = doc(db, `households/${householdId}/shoppingItems/${itemId}`);
  const payload: any = {
    isCompleted,
    completedAt: isCompleted ? serverTimestamp() : null,
    updatedAt: serverTimestamp(),
  };

  if (actualPrice !== undefined) {
    payload.actualPrice = actualPrice;
  }

  await updateDoc(itemRef, payload);
}

export async function updateShoppingItem(
  householdId: string,
  itemId: string,
  data: Partial<ShoppingItem>
): Promise<void> {
  const itemRef = doc(db, `households/${householdId}/shoppingItems/${itemId}`);
  const payload: any = {
    ...data,
    updatedAt: serverTimestamp(),
  };

  Object.keys(payload).forEach((key) => payload[key] === undefined && delete payload[key]);
  await updateDoc(itemRef, payload);
}

export async function deleteShoppingItem(
  householdId: string,
  itemId: string
): Promise<void> {
  const itemRef = doc(db, `households/${householdId}/shoppingItems/${itemId}`);
  await deleteDoc(itemRef);
}

export async function checkoutShoppingList(
  householdId: string,
  itemIdsToClear: string[],
  totalAmount: number,
  walletId: string,
  categoryId?: string,
  notes?: string,
  createdById?: string,
  creatorName?: string
): Promise<void> {
  await runTransaction(db, async (t) => {
    // 1. Create Transaction doc
    const txRef = doc(collection(db, `households/${householdId}/transactions`));
    const txData = {
      id: txRef.id,
      type: "expense",
      amount: totalAmount,
      walletId: walletId,
      categoryId: categoryId || null,
      transactionDate: Timestamp.now(),
      notes: notes || "Belanja Kebutuhan Rumah Tangga",
      createdById: createdById || "system",
      creatorName: creatorName || "Anggota",
      createdAt: serverTimestamp(),
    };
    t.set(txRef, txData);

    // 2. Deduct from wallet
    const walletRef = doc(db, `households/${householdId}/wallets/${walletId}`);
    const walletSnap = await t.get(walletRef);
    if (walletSnap.exists()) {
      const walletData = walletSnap.data();
      const newBal = (walletData.currentBalance || 0) - totalAmount;
      t.update(walletRef, {
        currentBalance: newBal,
        updatedAt: serverTimestamp(),
      });
    }

    // 3. Delete / Clear checked items
    for (const itemId of itemIdsToClear) {
      const itemRef = doc(db, `households/${householdId}/shoppingItems/${itemId}`);
      t.delete(itemRef);
    }
  });
}

export async function clearAllCompletedShoppingItems(
  householdId: string,
  items: ShoppingItem[]
): Promise<void> {
  const completed = items.filter((i) => i.isCompleted);
  await Promise.all(
    completed.map((item) => {
      const itemRef = doc(db, `households/${householdId}/shoppingItems/${item.id}`);
      return deleteDoc(itemRef);
    })
  );
}
