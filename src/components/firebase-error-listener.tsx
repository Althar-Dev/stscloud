'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';

export function FirebaseErrorListener() {
  useEffect(() => {
    const handlePermissionError = (error: any) => {
      // Throwing the error as an uncaught exception triggers the Next.js 
      // development error overlay with our rich contextual data.
      // We wrap it in a microtask to ensure it doesn't break the current execution flow.
      queueMicrotask(() => {
        throw error;
      });
    };

    errorEmitter.on('permission-error', handlePermissionError);
    return () => {
      errorEmitter.removeListener('permission-error', handlePermissionError);
    };
  }, []);

  return null;
}
