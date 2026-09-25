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

export async function findHouseholdByMemberUid(uid: string): Promise<Household | null> {
  try {
    const q = query(
      collection(db, "households"),
      where("memberUids", "array-contains", uid)
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const docSnap = snap.docs[0];
    return { id: docSnap.id, ...docSnap.data() } as Household;
  } catch (e) {
    console.warn("findHouseholdByMemberUid query failed:", e);
    return null;
  }
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const userRef = doc(db, `users/${uid}`);
  const snap = await getDoc(userRef);
  
  if (snap.exists()) {
    const data = snap.data() as UserProfile;
    // If householdId is missing or empty, attempt auto-recovery from households collection
    if (!data.householdId) {
      const recoveredHh = await findHouseholdByMemberUid(uid);
      if (recoveredHh) {
        const isFirstMember = recoveredHh.memberUids?.[0] === uid;
        const role = data.role || (isFirstMember ? "owner" : "member");
        const updatedProfile: UserProfile = {
          ...data,
          householdId: recoveredHh.id,
          role: role,
        };
        try {
          await updateDoc(userRef, { householdId: recoveredHh.id, role: role });
        } catch (e) {
          console.warn("Failed to update recovered householdId:", e);
        }
        return updatedProfile;
      }
    }
    return data;
  }

  // If user document does not exist at all, check if user is in any household memberUids
  const hh = await findHouseholdByMemberUid(uid);
  if (hh) {
    const isFirstMember = hh.memberUids?.[0] === uid;
    const authUser = auth.currentUser;
    const newProfile: UserProfile = {
      uid,
      email: authUser?.email || "",
      displayName: authUser?.displayName || "Pengguna",
      photoURL: authUser?.photoURL || "",
      householdId: hh.id,
      role: isFirstMember ? "owner" : "member",
      createdAt: new Date(),
    };
    try {
      await setDoc(userRef, {
        ...newProfile,
        createdAt: serverTimestamp(),
      });
    } catch (e) {
      console.warn("Failed to set recovered user profile doc:", e);
    }
    return newProfile;
  }

  return null;
}

export async function getHousehold(householdId: string): Promise<Household | null> {
  const hhRef = doc(db, `households/${householdId}`);
  const snap = await getDoc(hhRef);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Household;
}

// Invite codes are resolved through `inviteCodes/{code}` (readable by exact code
// only) so household documents never have to be readable by non-members.
async function createInviteCodeIndex(inviteCode: string, householdId: string): Promise<void> {
  await setDoc(doc(db, `inviteCodes/${inviteCode}`), { householdId });
}

// Backfills the invite code index for households created before it existed.
export async function ensureInviteCodeIndex(household: Household): Promise<void> {
  if (!household.inviteCode) return;
  const codeRef = doc(db, `inviteCodes/${household.inviteCode}`);
  const snap = await getDoc(codeRef);
  if (!snap.exists()) {
    await createInviteCodeIndex(household.inviteCode, household.id);
  }
}

export async function createHouseholdForUser(
  uid: string,
  householdName: string,
  displayName: string,
  email: string,
  photoURL?: string
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
  await createInviteCodeIndex(inviteCode, hhDoc.id);

  const userProfile: UserProfile = {
    uid,
    email: email || "",
    displayName: displayName || "Kepala Keluarga",
    photoURL: photoURL || "",
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
  email: string,
  photoURL?: string
): Promise<{ householdId: string; userProfile: UserProfile }> {
  const cleanCode = inviteCode.trim().toUpperCase();
  const codeSnap = cleanCode ? await getDoc(doc(db, `inviteCodes/${cleanCode}`)) : null;

  if (!codeSnap?.exists()) {
    throw new Error("Kode undangan rumah tangga tidak valid atau tidak ditemukan");
  }

  const hhId = codeSnap.data().householdId as string;
  const hhRef = doc(db, `households/${hhId}`);

  // Join first: the household document is only readable by members.
  // arrayUnion is a no-op when the user is already a member.
  await updateDoc(hhRef, {
    memberUids: arrayUnion(uid),
    updatedAt: serverTimestamp(),
  });

  const hhSnap = await getDoc(hhRef);
  const hhData = hhSnap.data() as Household;

  // Check role preservation or owner assignment
  let role: "owner" | "member" = "member";
  const isFirstMember = hhData.memberUids?.[0] === uid;
  
  const existingUserRef = doc(db, `users/${uid}`);
  const existingSnap = await getDoc(existingUserRef);
  const existingRole = existingSnap.exists() ? (existingSnap.data() as UserProfile).role : null;

  if (isFirstMember || existingRole === "owner") {
    role = "owner";
  } else {
    // Check if there is any active owner in this household
    const existingMembers = await getHouseholdMembers(hhData.memberUids || []);
    const hasOwner = existingMembers.some((m) => m.role === "owner" && m.uid !== uid);
    if (!hasOwner) {
      role = "owner";
    }
  }

  const userProfile: UserProfile = {
    uid,
    email: email || "",
    displayName: displayName || (role === "owner" ? "Kepala Keluarga" : "Anggota Keluarga"),
    photoURL: photoURL || "",
    householdId: hhId,
    role,
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

export async function updateMemberRole(
  targetUid: string,
  role: "owner" | "member"
): Promise<void> {
  const userRef = doc(db, `users/${targetUid}`);
  await updateDoc(userRef, { role });
}

export async function getHouseholdMembers(memberUids: string[]): Promise<UserProfile[]> {
  if (!memberUids || memberUids.length === 0) return [];
  const snaps = await Promise.all(memberUids.map((uid) => getDoc(doc(db, `users/${uid}`))));
  return snaps.filter((snap) => snap.exists()).map((snap) => snap.data() as UserProfile);
}


