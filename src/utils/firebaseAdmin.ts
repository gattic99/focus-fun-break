
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";

/**
 * Admin utility to set the OpenAI API key in Firebase Firestore
 * This should be run only once to set up your key, and not included in the production build
 * 
 * IMPORTANT: After running this once, remove this file or comment out the code to prevent
 * exposing your API key in the source code.
 */
export const setOpenAIApiKeyInFirestore = async (apiKey: string): Promise<void> => {
  try {
    // Store the API key in Firestore
    await setDoc(doc(db, "apiKeys", "lovableAi"), {
      key: apiKey,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    console.log("API key successfully stored in Firestore");
  } catch (error) {
    console.error("Error storing API key in Firestore:", error);
    throw error;
  }
};

/**
 * Utility to check if the API key is already stored in Firestore
 * This can be used to verify the setup
 */
export const checkOpenAIApiKeyInFirestore = async (): Promise<boolean> => {
  try {
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
    return false;
  }
};
