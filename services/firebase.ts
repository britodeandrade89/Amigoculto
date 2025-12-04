import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Helper to safely get the global config
const getFirebaseConfig = () => {
  let config;

  // 1. Try global variable (injected by environment)
  try {
    // @ts-ignore
    if (typeof __firebase_config !== 'undefined') {
      // @ts-ignore
      config = __firebase_config;
    }
  } catch (e) {
    // Ignore reference errors
  }

  // 2. Try window property
  if (!config && typeof window !== 'undefined') {
    config = (window as any).__firebase_config;
  }

  // 3. Parse if string
  if (config && typeof config === 'string') {
    try {
      config = JSON.parse(config);
    } catch (e) {
      console.error('Invalid JSON in firebase config', e);
    }
  }

  // 4. Validate or Fallback
  if (!config || !config.apiKey) {
    console.warn('Using mock Firebase config. Auth will fail.');
    return {
      apiKey: "mock_key",
      authDomain: "mock.firebaseapp.com",
      projectId: "mock-project"
    };
  }

  return config;
};

const app = initializeApp(getFirebaseConfig());
export const auth = getAuth(app);
export const db = getFirestore(app);