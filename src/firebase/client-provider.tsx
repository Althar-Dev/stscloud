'use client';

import React, { useMemo, ReactNode, useState, useEffect } from 'react';
import { initializeFirebase } from './index';
import { FirebaseProvider } from './provider';
import { onAuthStateChanged } from 'firebase/auth';

/**
 * @fileOverview Provider utama di sisi klien yang menangani inisialisasi Firebase.
 * Diperbarui: Menghapus blocking loader agar Landing Page muncul seketika.
 */

export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  const { app, db, auth } = useMemo(() => initializeFirebase(), []);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, () => {
      setInitialLoading(false);
    });
    return () => unsubscribe();
  }, [auth]);

  return (
    <FirebaseProvider app={app} db={db} auth={auth}>
      {children}
    </FirebaseProvider>
  );
}
