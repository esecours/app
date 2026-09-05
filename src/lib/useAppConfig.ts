import { useState, useEffect } from 'react';
import { db } from './firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from './firebase-errors';

interface AppContent {
  loginTitle?: string;
  loginImageUrl?: string;
  about?: string;
  contactInfo?: {
    address?: string;
    phone?: string;
    email?: string;
  };
  numbers?: any[];
  tips?: any[];
}

export const useAppConfig = () => {
  const [config, setConfig] = useState<AppContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'app_config', 'content'), (snap) => {
      if (snap.exists()) {
        setConfig(snap.data() as AppContent);
      }
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'app_config/content');
      setLoading(false);
    });

    return () => unsub();
  }, []);

  return { config, loading };
};
