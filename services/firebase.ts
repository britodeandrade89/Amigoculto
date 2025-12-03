import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Declare the global variable that is injected by the environment
declare const __firebase_config: string | undefined;

const getFirebaseConfig = () => {
  // 1. Try accessing the global variable directly (common in this environment)
  try {
    if (typeof __firebase_config !== 'undefined') {
      return JSON.parse(__firebase_config);
    }
  } catch (e) {
    // Ignore ReferenceErrors or ParseErrors
  }

  // 2. Try accessing via window object
  if (typeof window !== 'undefined' && (window as any).__firebase_config) {
    try {
      const configStr = (window as any).__firebase_config;
      return typeof configStr === 'string' ? JSON.parse(configStr) : configStr;
    } catch (e) {
      console.error("Failed to parse firebase config from window", e);
    }
  }

  // 3. Fallback (This will cause auth errors if real config is missing)
  console.warn("Firebase config not found. Using mock config.");
  return {
      apiKey: "mock_key",
      authDomain: "mock.firebaseapp.com",
      projectId: "mock-project",
  };
};

const firebaseConfig = getFirebaseConfig();
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);