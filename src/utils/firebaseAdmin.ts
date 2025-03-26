
import { doc, setDoc } from "firebase/firestore";
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
    await setDoc(doc(db, "secrets", "openai"), {
      apiKey: apiKey,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    console.log("API key successfully stored in Firestore");
  } catch (error) {
    console.error("Error storing API key in Firestore:", error);
    throw error;
  }
};
