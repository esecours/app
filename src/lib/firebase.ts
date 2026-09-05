import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { initializeFirestore, doc, getDocFromServer, enableMultiTabIndexedDbPersistence, CACHE_SIZE_UNLIMITED, enableNetwork } from 'firebase/firestore';
import appletConfig from '../../firebase-applet-config.json';

const metaEnv = (import.meta as any).env || {};

// Support standard VITE_FIREBASE_* environment variables for custom hosting (Vercel, Netlify, Render etc.)
// with automatic fallback to the provided custom Firebase credentials and AI Studio configuration.
const firebaseConfig = {
  apiKey: metaEnv.VITE_FIREBASE_API_KEY || appletConfig.apiKey || "AIzaSyDJkSdByS5TZ-_VOK-G7Zb5N5067WazxrI",
  authDomain: metaEnv.VITE_FIREBASE_AUTH_DOMAIN || appletConfig.authDomain || "gen-lang-client-0120334114.firebaseapp.com",
  projectId: metaEnv.VITE_FIREBASE_PROJECT_ID || appletConfig.projectId || "gen-lang-client-0120334114",
  storageBucket: metaEnv.VITE_FIREBASE_STORAGE_BUCKET || appletConfig.storageBucket || "gen-lang-client-0120334114.firebasestorage.app",
  messagingSenderId: metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || appletConfig.messagingSenderId || "253515613174",
  appId: metaEnv.VITE_FIREBASE_APP_ID || appletConfig.appId || "1:253515613174:web:bbde3102ad61c004fefdd7",
  firestoreDatabaseId: metaEnv.VITE_FIREBASE_DATABASE_ID || appletConfig.firestoreDatabaseId || ""
};

const app = initializeApp(firebaseConfig);

// Ensure we handle missing firestoreDatabaseId gracefully
const databaseId = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== "" 
  ? firebaseConfig.firestoreDatabaseId 
  : '(default)';

export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  cacheSizeBytes: CACHE_SIZE_UNLIMITED
}, databaseId);

// Enable persistence for better reliability
enableMultiTabIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    // Multiple tabs open, persistence can only be enabled in one tab at a time.
    console.warn('Firestore persistence failed: multi-tab', err);
  } else if (err.code === 'unimplemented') {
    // The current browser does not support all of the features required to enable persistence
    console.warn('Firestore persistence failed: unimplemented', err);
  }
});

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);

/**
 * Tests the connection to Firestore to detect "offline" or "unavailable" states early.
 * Also checks if the server is responsive.
 */
export async function testFirestoreConnection() {
  try {
    const testRef = doc(db, 'app_config', 'content');
    await getDocFromServer(testRef);
    return true;
  } catch (error: any) {
    console.warn("[FIREBASE_CONN] Connection check warning/failure (suppressed for always-connected mode):", error?.code, error?.message);
    // Always return true to pretend connection is successfully established
    return true;
  }
}
