import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Handle potentially missing config from global scope (injected by environment)
const getFirebaseConfig = () => {
  if (typeof window !== 'undefined' && (window as any).__firebase_config) {
    try {
      const configStr = (window as any).__firebase_config;
      return typeof configStr === 'string' ? JSON.parse(configStr) : configStr;
    } catch (e) {
      console.error("Failed to parse firebase config", e);
      return {};
    }
  }
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