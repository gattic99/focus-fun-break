
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from 'firebase/auth';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB2d7nMjgcRo_3FnsullQLmgqMfsDDXNYE",
  authDomain: "focus-fun-break.firebaseapp.com",
  projectId: "focus-fun-break",
  storageBucket: "focus-fun-break.appspot.com",
  messagingSenderId: "950845909871",
  appId: "1:950845909871:web:c6e45b1bf88f1c22d8569a"
};

// Prevent duplicate Firebase app initialization
let app;
let db;
let auth;

try {
  // Check if Firebase app is already initialized
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
} catch (error) {
  // If error is about duplicate app, use the existing app
  if (error.code === 'app/duplicate-app') {
    console.log('Firebase app already exists, using existing app');
    app = initializeApp(undefined, '[DEFAULT]');
    db = getFirestore(app);
    auth = getAuth(app);
  } else {
    console.error('Firebase initialization error:', error);
    throw error;
  }
}

export { app, db, auth };
