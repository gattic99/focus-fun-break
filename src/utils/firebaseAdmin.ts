
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";
import { toast } from "sonner";

/**
 * Admin utility to set the OpenAI API key in Firebase Firestore
 * This should be run only once to set up your key, and not included in the production build
 */
export const setOpenAIApiKeyInFirestore = async (apiKey: string): Promise<void> => {
  try {
    if (!apiKey || apiKey.trim() === '') {
      throw new Error("API key cannot be empty");
    }
    
    if (!apiKey.startsWith('sk-')) {
      throw new Error("API key must start with 'sk-'");
    }
    
    console.log("Attempting to store API key in Firestore...");
    
    // Store the API key in Firestore with better error handling
    try {
      await setDoc(doc(db, "apiKeys", "lovableAi"), {
        key: apiKey,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      // Verify the key was stored correctly
      const docRef = doc(db, "apiKeys", "lovableAi");
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error("Failed to verify stored API key");
      }
      
      console.log("API key successfully stored and verified in Firestore");
      toast.success("API key successfully stored in Firestore");
      return Promise.resolve();
    } catch (firestoreError) {
      console.error("Firestore operation error:", firestoreError);
      
      // Check if it's a permissions error
      if (firestoreError.code === "permission-denied") {
        throw new Error("Permission denied. Check Firestore security rules");
      } else {
        throw firestoreError;
      }
    }
  } catch (error) {
    console.error("Error storing API key in Firestore:", error);
    toast.error("Error storing API key: " + (error instanceof Error ? error.message : String(error)));
    throw error;
  }
};

/**
 * Utility to check if the API key is already stored in Firestore
 * This can be used to verify the setup
 */
export const checkOpenAIApiKeyInFirestore = async (): Promise<boolean> => {
  try {
    console.log("Checking for API key in Firestore...");
    const docRef = doc(db, "apiKeys", "lovableAi");
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists() && docSnap.data().key) {
      console.log("API key is stored in Firestore");
      return true;
    } else {
      console.log("API key is not stored in Firestore");
      return false;
    }
  } catch (error) {
    console.error("Error checking API key in Firestore:", error);
    
    // Check if it's a permissions error and log accordingly
    if (error.code === "permission-denied") {
      console.error("Permission denied when accessing Firestore. Check security rules.");
    }
    
    return false;
  }
};

/**
 * Utility to get the OpenAI API key from Firestore
 * This is the primary function to retrieve the API key
 */
export const getOpenAIApiKeyFromFirestore = async (): Promise<string | null> => {
  try {
    console.log("Attempting to retrieve API key from Firestore...");
    const docRef = doc(db, "apiKeys", "lovableAi");
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists() && docSnap.data().key) {
      console.log("Successfully retrieved API key from Firestore");
      return docSnap.data().key;
    } else {
      console.log("No API key found in Firestore");
      return null;
    }
  } catch (error) {
    console.error("Error retrieving API key from Firestore:", error);
    
    // Check if it's a permissions error and log accordingly
    if (error.code === "permission-denied") {
      console.error("Permission denied when accessing Firestore. Check security rules.");
    }
    
    return null;
  }
};
