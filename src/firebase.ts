import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBzQUasinAfDO_NiejzLTIn7NTlU8bGHqg",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "flow-crm-6e96f.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "flow-crm-6e96f",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "flow-crm-6e96f.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "642812100230",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:642812100230:web:0ba2fc8911f4219eed5b07"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export default app;
