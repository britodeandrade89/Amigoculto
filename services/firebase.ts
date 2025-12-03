import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Declare the global variable that is injected by the environment.
// Using 'var' and 'any' is safer for global injections that might conflict with block scopes.
declare var __firebase_config: any;

const getFirebaseConfig = () => {
  let rawConfig = null;

  try {
    // 1. Try accessing via window object (Standard for client-side injection)
    if (typeof window !== 'undefined' && (window as any).__firebase_config) {
      rawConfig = (window as any).__firebase_config;
    }
    // 2. Try accessing the global variable directly
    else if (typeof __firebase_config !== 'undefined') {
      rawConfig = __firebase_config;
    }
  } catch (e) {
    // Ignore access errors
  }

  if (rawConfig) {
    try {
      // If it's a string, parse it. If it's already an object, use it.
      return typeof rawConfig === 'string' ? JSON.parse(rawConfig) : rawConfig;
    } catch (e) {
      console.error("Failed to parse firebase config", e);
    }
  }

  console.warn("Firebase config not found. Falling back to mock (Auth will fail).");
  return {
      apiKey: "mock_key_fallback",
      authDomain: "mock.firebaseapp.com",
      projectId: "mock-project",
  };
};

const firebaseConfig = getFirebaseConfig();
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);