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
  writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { subscribeQuery } from "@/lib/firestoreSubscribe";
import { ShoppingItem } from "@/types";

function shoppingItemsQuery(householdId: string) {
  return query(
    collection(db, `households/${householdId}/shoppingItems`),
    orderBy("createdAt", "desc")
  );
}

export function subscribeShoppingItems(
  householdId: string,
  onData: (items: ShoppingItem[]) => void
) {
  return subscribeQuery<ShoppingItem>(shoppingItemsQuery(householdId), onData, "daftar belanja");
}

export async function getShoppingItems(householdId: string): Promise<ShoppingItem[]> {
  const snapshot = await getDocs(shoppingItemsQuery(householdId));
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
  const walletRef = doc(db, `households/${householdId}/wallets/${walletId}`);
  const txRef = doc(collection(db, `households/${householdId}/transactions`));

  await runTransaction(db, async (t) => {
    // Firestore transactions require all reads before any writes
    const walletSnap = await t.get(walletRef);

    // 1. Create Transaction doc
    t.set(txRef, {
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
    });

    // 2. Deduct from wallet
    if (walletSnap.exists()) {
      t.update(walletRef, {
        currentBalance: (walletSnap.data().currentBalance || 0) - totalAmount,
        updatedAt: serverTimestamp(),
      });
    }

    // 3. Delete / Clear checked items
    for (const itemId of itemIdsToClear) {
      t.delete(doc(db, `households/${householdId}/shoppingItems/${itemId}`));
    }
  });
}

export async function clearAllCompletedShoppingItems(
  householdId: string,
  items: ShoppingItem[]
): Promise<void> {
  const completed = items.filter((i) => i.isCompleted);
  if (completed.length === 0) return;

  const batch = writeBatch(db);
  for (const item of completed) {
    batch.delete(doc(db, `households/${householdId}/shoppingItems/${item.id}`));
  }
  await batch.commit();
}
