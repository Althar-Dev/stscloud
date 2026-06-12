'use client';

import React, { useMemo, ReactNode, useState, useEffect } from 'react';
import { initializeFirebase } from './index';
import { FirebaseProvider } from './provider';
import { onAuthStateChanged } from 'firebase/auth';
import { Loader } from '@/components/loader';

/**
 * @fileOverview Provider utama di sisi klien yang menangani inisialisasi Firebase
 * dan memastikan loading hanya terjadi satu kali saat aplikasi pertama kali dimuat.
 */

export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  const { app, db, auth } = useMemo(() => initializeFirebase(), []);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    // Listener ini menangani resolusi auth pertama kali untuk seluruh sesi aplikasi.
    // Setelah auth terdeteksi (logged in atau guest), loading dihentikan secara permanen.
    const unsubscribe = onAuthStateChanged(auth, () => {
      setInitialLoading(false);
    });
    return () => unsubscribe();
  }, [auth]);

  // Tampilkan loader bermerek hanya saat pertama kali membuka web.
  if (initialLoading) {
    return <Loader />;
  }

  return (
    <FirebaseProvider app={app} db={db} auth={auth}>
      {children}
    </FirebaseProvider>
  );
}
