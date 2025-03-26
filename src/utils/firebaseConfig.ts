
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your Firebase configuration
// Replace with your actual Firebase project config
const firebaseConfig = {
  apiKey: "AIzaSyB2d7nMjgcRo_3FnsullQLmgqMfsDDXNYE",
  authDomain: "focus-fun-break.firebaseapp.com",
  projectId: "focus-fun-break",
  storageBucket: "focus-fun-break.firebasestorage.app",
  messagingSenderId: "950845909871",
  appId: "1:950845909871:web:c6e45b1bf88f1c22d8569a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { app, db };
