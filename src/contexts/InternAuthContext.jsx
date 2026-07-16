import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { collection, query, where, getDocs, onSnapshot, doc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

const InternAuthContext = createContext(null);

export const InternAuthProvider = ({ children }) => {
  const [internUser, setInternUser] = useState(null);      // Firebase Auth user
  const [internProfile, setInternProfile] = useState(null); // Firestore application doc
  const [loading, setLoading] = useState(true);
  const [accessRevoked, setAccessRevoked] = useState(false);

  // ── Listen to Firebase Auth state ────────────────────────────────────────────
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setInternUser(null);
        setInternProfile(null);
        setAccessRevoked(false);
        setLoading(false);
        return;
      }

      // Check custom claim — only interns have role: 'intern'
      const tokenResult = await firebaseUser.getIdTokenResult(true);
      const isIntern = tokenResult.claims.role === 'intern';

      if (!isIntern) {
        // This is an admin account, not an intern — don't set intern context
        setInternUser(null);
        setInternProfile(null);
        setLoading(false);
        return;
      }

      setInternUser(firebaseUser);

      // Fetch the intern's application profile from Firestore
      try {
        const q = query(
          collection(db, 'internship_applications'),
          where('credUid', '==', firebaseUser.uid)
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          const profileData = { id: snap.docs[0].id, ...snap.docs[0].data() };

          // Security check — if admin has revoked access, force logout
          if (profileData.credActive === false) {
            setAccessRevoked(true);
            await signOut(auth);
            setInternUser(null);
            setInternProfile(null);
            setLoading(false);
            return;
          }

          setInternProfile(profileData);
          setAccessRevoked(false);
        }
      } catch (err) {
        console.error('[InternAuth] Failed to fetch intern profile:', err);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ── Real-time listener for profile changes while intern is logged in ────────
  useEffect(() => {
    if (!internUser || !internProfile?.id) return;

    // Listen to the intern's specific doc (not entire collection)
    const unsubscribeProfile = onSnapshot(
      doc(db, 'internship_applications', internProfile.id),
      (docSnap) => {
        if (!docSnap.exists()) return;
        const data = docSnap.data();
        // If admin revokes while intern is actively logged in — force logout
        if (data.credActive === false) {
          setAccessRevoked(true);
          signOut(auth);
        } else {
          setInternProfile({ id: docSnap.id, ...data });
        }
      },
      (err) => {
        console.error('[InternAuth] Real-time profile listener error:', err);
      }
    );

    return () => unsubscribeProfile();
  }, [internUser, internProfile?.id]);

  // ── Login ─────────────────────────────────────────────────────────────────────
  const internLogin = useCallback(async (email, password) => {
    const cleanEmail = email.trim().toLowerCase();
    const userCred = await signInWithEmailAndPassword(auth, cleanEmail, password);
    
    // Check if this account has intern role
    const tokenResult = await userCred.user.getIdTokenResult(true);
    if (tokenResult.claims.role !== 'intern') {
      await signOut(auth);
      throw new Error('These credentials are not for the Intern Portal. Please use the Admin login.');
    }

    // Check Firestore credActive before allowing in
    const q = query(
      collection(db, 'internship_applications'),
      where('credUid', '==', userCred.user.uid)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      const data = snap.docs[0].data();
      if (data.credActive === false) {
        await signOut(auth);
        throw new Error('Your internship access has been revoked. Please contact the admin team.');
      }
    }

    return userCred;
  }, []);

  // ── Logout ────────────────────────────────────────────────────────────────────
  const internLogout = useCallback(async () => {
    await signOut(auth);
    setInternUser(null);
    setInternProfile(null);
    setAccessRevoked(false);
  }, []);

  const value = {
    internUser,
    internProfile,
    loading,
    accessRevoked,
    internLogin,
    internLogout,
    isInternAuthenticated: () => !!internUser && !!internProfile,
  };

  return (
    <InternAuthContext.Provider value={value}>
      {children}
    </InternAuthContext.Provider>
  );
};

export const useInternAuth = () => {
  const context = useContext(InternAuthContext);
  if (!context) {
    throw new Error('useInternAuth must be used within an InternAuthProvider');
  }
  return context;
};

export default InternAuthContext;
