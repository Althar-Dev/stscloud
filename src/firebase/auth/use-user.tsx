
'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { useAuth } from '../provider';
import { getAuthSession } from '@/app/actions/auth-actions';

/**
 * @fileOverview Hook for retrieving user status.
 * Optimized for cross-subdomain session synchronization using root domain cookies.
 */

export function useUser() {
  const auth = useAuth();
  
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [loading, setLoading] = useState(true);
  const [sessionUid, setSessionUid] = useState<string | null>(null);

  useEffect(() => {
    // 1. Check for shared session cookie first to provide immediate UX feedback
    getAuthSession().then(uid => {
      setSessionUid(uid);
      // If we have a session cookie but Firebase SDK is still null, 
      // we keep loading true or handle accordingly to prevent flicker
    });

    // 2. Standard Firebase Auth listener
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  // Derived state: User is authenticated if either Firebase SDK or root cookie is present
  const isAuthenticated = !!user || !!sessionUid;

  return { user, loading, isAuthenticated, sessionUid };
}
