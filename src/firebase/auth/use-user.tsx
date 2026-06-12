'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { useAuth } from '../provider';

/**
 * @fileOverview Hook untuk mengambil status pengguna.
 * Dioptimalkan agar tidak memicu flash loading saat navigasi antar halaman.
 */

export function useUser() {
  const auth = useAuth();
  
  // Inisialisasi dengan state saat ini dari instance auth untuk menghindari 
  // status 'loading: true' saat berpindah halaman secara internal (SPA).
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [loading, setLoading] = useState(!auth.currentUser);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  return { user, loading };
}
