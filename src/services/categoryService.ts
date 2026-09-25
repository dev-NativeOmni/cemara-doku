import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { subscribeQuery } from "@/lib/firestoreSubscribe";
import { Category } from "@/types";

export const DEFAULT_CATEGORIES: Omit<Category, "id">[] = [
  // Expense
  { name: "Belanja Dapur & Sembako", type: "expense", icon: "ShoppingBag", color: "#F59E0B", isDefault: true },
  { name: "Tagihan & Utilitas", type: "expense", icon: "Zap", color: "#EF4444", isDefault: true },
  { name: "Keluarga & Anak", type: "expense", icon: "Users", color: "#EC4899", isDefault: true },
  { name: "Transportasi & Bensin", type: "expense", icon: "Car", color: "#3B82F6", isDefault: true },
  { name: "Sosial & Ibadah", type: "expense", icon: "HeartHandshake", color: "#10B981", isDefault: true },
  { name: "Makan di Luar & Hiburan", type: "expense", icon: "Coffee", color: "#8B5CF6", isDefault: true },
  { name: "Kesehatan & Darurat", type: "expense", icon: "Activity", color: "#DC2626", isDefault: true },
  { name: "Lain-lain", type: "expense", icon: "MoreHorizontal", color: "#64748B", isDefault: true },
  // Income
  { name: "Gaji Bulanan", type: "income", icon: "Briefcase", color: "#10B981", isDefault: true },
  { name: "Bonus & THR", type: "income", icon: "Gift", color: "#059669", isDefault: true },
  { name: "Usaha & Freelance", type: "income", icon: "TrendingUp", color: "#0D9488", isDefault: true },
  { name: "Pemasukan Lainnya", type: "income", icon: "PlusCircle", color: "#14B8A6", isDefault: true },
];

export async function seedDefaultCategories(householdId: string): Promise<void> {
  const batch = writeBatch(db);
  const categoriesRef = collection(db, `households/${householdId}/categories`);
  
  for (const cat of DEFAULT_CATEGORIES) {
    const newDoc = doc(categoriesRef);
    batch.set(newDoc, {
      ...cat,
      id: newDoc.id,
    });
  }
  
  await batch.commit();
}

export function subscribeCategories(householdId: string, onData: (categories: Category[]) => void) {
  return subscribeQuery<Category>(
    collection(db, `households/${householdId}/categories`),
    onData,
    "kategori"
  );
}

export async function getCategories(householdId: string): Promise<Category[]> {
  const categoriesRef = collection(db, `households/${householdId}/categories`);
  const snapshot = await getDocs(categoriesRef);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Category));
}

export async function createCategory(householdId: string, category: Omit<Category, "id">): Promise<string> {
  const categoriesRef = collection(db, `households/${householdId}/categories`);
  const newDoc = doc(categoriesRef);
  await setDoc(newDoc, {
    ...category,
    id: newDoc.id,
  });
  return newDoc.id;
}

export async function updateCategory(householdId: string, categoryId: string, data: Partial<Category>): Promise<void> {
  const catRef = doc(db, `households/${householdId}/categories/${categoryId}`);
  await updateDoc(catRef, data);
}

export async function deleteCategory(householdId: string, categoryId: string): Promise<void> {
  const catRef = doc(db, `households/${householdId}/categories/${categoryId}`);
  await deleteDoc(catRef);
}

