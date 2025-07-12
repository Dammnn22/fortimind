// Import the functions you need from the SDKs you need
import * as fbApp from "firebase/app";
import * as fbAuth from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";
import { 
  getFirestore
} from "firebase/firestore";
import { getStorage } from "firebase/storage";
// AiChatMessage is a separate type and its handling is within AiChatModal.
// No specific converters are needed here for it unless a generic one is desired.

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC53NkUarONGKhBrE-LynBVwVBtjbHk4Qk",
  authDomain: "fortimind.firebaseapp.com",
  projectId: "fortimind",
  storageBucket: "fortimind.firebasestorage.app",
  messagingSenderId: "800747065144",
  appId: "1:800747065144:web:2401682ec1058eeec9fbcd",
  measurementId: "G-083RNFKKY5"
};

// Initialize Firebase - Check if app already exists
let app: fbApp.FirebaseApp;
try {
  app = fbApp.getApp(); // Try to get existing app
} catch (error) {
  app = fbApp.initializeApp(firebaseConfig); // Initialize if doesn't exist
}

const auth: fbAuth.Auth = fbAuth.getAuth(app);

// Configure Firestore with better connection settings
const db = getFirestore(app);

// Enable offline persistence using the new cache setting (recommended approach)
// Note: The new recommended approach is to use FirestoreSettings.cache
// but for now we'll keep the existing approach with error handling
try {
  // Only enable if not already enabled
  const enablePersistence = async () => {
    try {
      const { enableIndexedDbPersistence } = await import("firebase/firestore");
      await enableIndexedDbPersistence(db);
      console.log('✅ Firestore offline persistence enabled');
    } catch (err: any) {
      if (err.code === 'failed-precondition') {
        console.log('⚠️ Multiple tabs open, persistence can only be enabled in one tab at a time.');
      } else if (err.code === 'unimplemented') {
        console.log('⚠️ The current browser does not support persistence.');
      } else {
        console.log('⚠️ Persistence already enabled or error:', err.message);
      }
    }
  };
  
  enablePersistence();
} catch (error) {
  console.log('Firestore persistence setup skipped');
}

const storage = getStorage(app);

// Initialize Analytics only if supported (prevents errors in SSR)
let analytics: ReturnType<typeof getAnalytics> | null = null;
if (typeof window !== 'undefined') {
  isSupported().then((yes) => {
    if (yes) {
      analytics = getAnalytics(app);
      console.log('🔥 Firebase Analytics initialized successfully');
    }
  });
}

const googleProvider = new fbAuth.GoogleAuthProvider();
const facebookProvider = new fbAuth.FacebookAuthProvider();

export { app, auth, db, storage, analytics, googleProvider, facebookProvider };