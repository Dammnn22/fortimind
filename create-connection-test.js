import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyATDIJzJhgHJQJKWBwSyU-LDPctgGUJpOE",
  authDomain: "fortimind.firebaseapp.com",
  projectId: "fortimind",
  storageBucket: "fortimind.firebasestorage.app",
  messagingSenderId: "1043716797768",
  appId: "1:1043716797768:web:2a36a0b5b32f1ed39e2bb3",
  measurementId: "G-JZ8RM89M6T"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function createConnectionTestDoc() {
  try {
    const testDoc = doc(db, '_connection_test', 'status');
    await setDoc(testDoc, {
      status: 'active',
      lastUpdated: new Date(),
      message: 'Connection monitoring document'
    });
    console.log('✅ Connection test document created successfully');
  } catch (error) {
    console.error('❌ Error creating connection test document:', error);
  }
}

createConnectionTestDoc();
