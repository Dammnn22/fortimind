import { useState, useEffect } from 'react';
import { onSnapshot, doc } from 'firebase/firestore';
import { db } from '../firebase';

export const useFirestoreConnection = () => {
  const [isConnected, setIsConnected] = useState(true);
  const [lastError, setLastError] = useState<string | null>(null);

  useEffect(() => {
    // Create a dummy document reference to monitor connection
    const dummyDoc = doc(db, '_connection_test', 'status');
    
    const unsubscribe = onSnapshot(
      dummyDoc,
      () => {
        setIsConnected(true);
        setLastError(null);
      },
      (error) => {
        console.log('Firestore connection error:', error);
        setIsConnected(false);
        setLastError(error.message);
      }
    );

    return () => unsubscribe();
  }, []);

  return { isConnected, lastError };
}; 