import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Declare the global variable that is injected by the environment.
// @ts-ignore
declare var __firebase_config: any;

const getFirebaseConfig = () => {
  let config = null;

  // 1. Try accessing via globalThis or window to avoid ReferenceError
  const globalScope = typeof globalThis !== 'undefined' ? globalThis : 
                      typeof window !== 'undefined' ? window : {};

  if ((globalScope as any).__firebase_config) {
    config = (globalScope as any).__firebase_config;
  }

  // 2. Try accessing direct variable if not found on global object
  if (!config) {
    try {
      if (typeof __firebase_config !== 'undefined') {
        config = __firebase_config;
      }
    } catch (e) {
      // variable not defined
    }
  }

  // 3. Parse if it's a JSON string
  if (config && typeof config === 'string') {
    try {
      return JSON.parse(config);
    } catch (e) {
      console.error("Failed to parse firebase config JSON", e);
      return null;
    }
  }

  // 4. Return config if valid object
  if (config && typeof config === 'object') {
    return config;
  }

  // 5. Fallback to prevent crash (auth/invalid-api-key)
  console.warn("No valid firebase config found. Using mock fallback.");
  return {
    apiKey: "mock_api_key_placeholder",
    authDomain: "mock.firebaseapp.com",
    projectId: "mock-project",
  };
};

const firebaseConfig = getFirebaseConfig();

// Initialize App
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);