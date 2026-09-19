"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User as FirebaseUser, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  getUserProfile,
  getHousehold,
  loginWithGoogle,
  loginWithEmail,
  registerWithEmail,
  logout as authLogout,
  createHouseholdForUser,
  joinHouseholdViaCode,
  updateUserProfile,
  updateMemberRole,
  getHouseholdMembers,
} from "@/services/authService";
import { Household, UserProfile } from "@/types";

interface AuthContextType {
  user: FirebaseUser | null;
  userProfile: UserProfile | null;
  household: Household | null;
  loading: boolean;
  loginGoogle: () => Promise<void>;
  loginEmail: (email: string, pass: string) => Promise<void>;
  registerEmail: (email: string, pass: string, name: string) => Promise<void>;
  createHousehold: (name: string) => Promise<void>;
  joinHousehold: (code: string) => Promise<void>;
  refreshHousehold: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  changeMemberRole: (targetUid: string, role: "owner" | "member") => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [household, setHousehold] = useState<Household | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const loadUserData = async (currentUser: FirebaseUser) => {
    try {
      let profile = await getUserProfile(currentUser.uid);
      if (profile) {
        // If profile has no photoURL but Google account has photoURL, set default photoURL
        if (!profile.photoURL && currentUser.photoURL) {
          try {
            await updateUserProfile(currentUser.uid, { photoURL: currentUser.photoURL });
            profile = { ...profile, photoURL: currentUser.photoURL };
          } catch (e) {
            console.warn("Could not sync photoURL:", e);
          }
        }
      }

      if (profile?.householdId) {
        const hh = await getHousehold(profile.householdId);
        if (hh) {
          // Auto-heal check: if current user is first member in household or if household has no owner
          const isFirstMember = hh.memberUids?.[0] === currentUser.uid;
          if (isFirstMember && profile.role !== "owner") {
            try {
              await updateMemberRole(currentUser.uid, "owner");
              profile = { ...profile, role: "owner" };
            } catch (e) {
              console.warn("Could not auto-promote creator to owner:", e);
            }
          } else if (profile.role !== "owner" && hh.memberUids) {
            // Check if there are any owners in the household at all
            const members = await getHouseholdMembers(hh.memberUids);
            const hasAnyOwner = members.some((m) => m.role === "owner");
            if (!hasAnyOwner) {
              try {
                await updateMemberRole(currentUser.uid, "owner");
                profile = { ...profile, role: "owner" };
              } catch (e) {
                console.warn("Could not auto-promote member to owner when no owner existed:", e);
              }
            }
          }
          setHousehold(hh);
        } else {
          setHousehold(null);
        }
      } else {
        setHousehold(null);
      }

      setUserProfile(profile);
    } catch (err) {
      console.error("Error loading user profile or household:", err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await loadUserData(currentUser);
      } else {
        setUserProfile(null);
        setHousehold(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginGoogle = async () => {
    setLoading(true);
    try {
      const u = await loginWithGoogle();
      await loadUserData(u);
    } finally {
      setLoading(false);
    }
  };

  const loginEmail = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const u = await loginWithEmail(email, pass);
      await loadUserData(u);
    } finally {
      setLoading(false);
    }
  };

  const registerEmail = async (email: string, pass: string, name: string) => {
    setLoading(true);
    try {
      const u = await registerWithEmail(email, pass, name);
      await loadUserData(u);
    } finally {
      setLoading(false);
    }
  };

  const createHousehold = async (name: string) => {
    if (!user) throw new Error("Pengguna belum masuk");
    setLoading(true);
    try {
      const { userProfile: newProfile, householdId } = await createHouseholdForUser(
        user.uid,
        name,
        user.displayName || user.email?.split("@")[0] || "User",
        user.email || "",
        user.photoURL || ""
      );
      setUserProfile(newProfile);
      const hh = await getHousehold(householdId);
      setHousehold(hh);
    } finally {
      setLoading(false);
    }
  };

  const joinHousehold = async (code: string) => {
    if (!user) throw new Error("Pengguna belum masuk");
    setLoading(true);
    try {
      const { userProfile: newProfile, householdId } = await joinHouseholdViaCode(
        user.uid,
        code,
        user.displayName || user.email?.split("@")[0] || "User",
        user.email || "",
        user.photoURL || ""
      );
      setUserProfile(newProfile);
      const hh = await getHousehold(householdId);
      setHousehold(hh);
    } finally {
      setLoading(false);
    }
  };

  const refreshHousehold = async () => {
    if (userProfile?.householdId) {
      const hh = await getHousehold(userProfile.householdId);
      setHousehold(hh);
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;
    await updateUserProfile(user.uid, data);
    const updated = await getUserProfile(user.uid);
    setUserProfile(updated);
  };

  const changeMemberRole = async (targetUid: string, role: "owner" | "member") => {
    await updateMemberRole(targetUid, role);
    if (user && targetUid === user.uid) {
      const updated = await getUserProfile(user.uid);
      setUserProfile(updated);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await authLogout();
      setUser(null);
      setUserProfile(null);
      setHousehold(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        household,
        loading,
        loginGoogle,
        loginEmail,
        registerEmail,
        createHousehold,
        joinHousehold,
        refreshHousehold,
        updateProfile,
        changeMemberRole,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

