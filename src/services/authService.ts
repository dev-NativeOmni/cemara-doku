import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  User as FirebaseUser,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  arrayUnion,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db, googleProvider } from "@/lib/firebase";
import { generateInviteCode } from "@/lib/formatters";
import { seedDefaultCategories } from "./categoryService";
import { seedDefaultWallets } from "./walletService";
import { Household, UserProfile } from "@/types";

export async function loginWithGoogle(): Promise<FirebaseUser> {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export async function loginWithEmail(email: string, pass: string): Promise<FirebaseUser> {
  const result = await signInWithEmailAndPassword(auth, email, pass);
  return result.user;
}

export async function registerWithEmail(
  email: string,
  pass: string,
  displayName: string
): Promise<FirebaseUser> {
  const result = await createUserWithEmailAndPassword(auth, email, pass);
  if (result.user) {
    await updateProfile(result.user, { displayName });
  }
  return result.user;
}

export async function logout(): Promise<void> {
  await signOut(auth);
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const userRef = doc(db, `users/${uid}`);
  const snap = await getDoc(userRef);
  if (!snap.exists()) return null;
  return snap.data() as UserProfile;
}

export async function getHousehold(householdId: string): Promise<Household | null> {
  const hhRef = doc(db, `households/${householdId}`);
  const snap = await getDoc(hhRef);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Household;
}

export async function createHouseholdForUser(
  uid: string,
  householdName: string,
  displayName: string,
  email: string
): Promise<{ householdId: string; userProfile: UserProfile }> {
  const householdsRef = collection(db, "households");
  const hhDoc = doc(householdsRef);
  const inviteCode = generateInviteCode(6);

  const householdData: Omit<Household, "id"> = {
    name: householdName || "Keluarga Cemara",
    currency: "IDR",
    memberUids: [uid],
    inviteCode,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await setDoc(hhDoc, {
    ...householdData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  const userProfile: UserProfile = {
    uid,
    email: email || "",
    displayName: displayName || "Kepala Keluarga",
    householdId: hhDoc.id,
    role: "owner",
    createdAt: new Date(),
  };

  await setDoc(doc(db, `users/${uid}`), {
    ...userProfile,
    createdAt: serverTimestamp(),
  });

  // Seed default wallets and categories
  try {
    await seedDefaultWallets(hhDoc.id);
    await seedDefaultCategories(hhDoc.id);
  } catch (err) {
    console.error("Error seeding defaults:", err);
  }

  return { householdId: hhDoc.id, userProfile };
}

export async function joinHouseholdViaCode(
  uid: string,
  inviteCode: string,
  displayName: string,
  email: string
): Promise<{ householdId: string; userProfile: UserProfile }> {
  const cleanCode = inviteCode.trim().toUpperCase();
  const q = query(
    collection(db, "households"),
    where("inviteCode", "==", cleanCode)
  );
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    throw new Error("Kode undangan rumah tangga tidak valid atau tidak ditemukan");
  }

  const hhDoc = snapshot.docs[0];
  const hhId = hhDoc.id;

  // Add UID to household memberUids
  await updateDoc(doc(db, `households/${hhId}`), {
    memberUids: arrayUnion(uid),
    updatedAt: serverTimestamp(),
  });

  const userProfile: UserProfile = {
    uid,
    email: email || "",
    displayName: displayName || "Anggota Keluarga",
    householdId: hhId,
    role: "member",
    createdAt: new Date(),
  };

  await setDoc(doc(db, `users/${uid}`), {
    ...userProfile,
    createdAt: serverTimestamp(),
  });

  return { householdId: hhId, userProfile };
}

export async function updateUserProfile(
  uid: string,
  data: Partial<UserProfile>
): Promise<void> {
  const userRef = doc(db, `users/${uid}`);
  await updateDoc(userRef, data);
}

export async function getHouseholdMembers(memberUids: string[]): Promise<UserProfile[]> {
  if (!memberUids || memberUids.length === 0) return [];
  const profiles: UserProfile[] = [];
  
  for (const uid of memberUids) {
    const userRef = doc(db, `users/${uid}`);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      profiles.push(snap.data() as UserProfile);
    }
  }
  
  return profiles;
}


