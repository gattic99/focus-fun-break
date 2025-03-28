
import { toast } from "sonner";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";
import { isExtensionContext, saveToLocalStorage, getFromLocalStorage } from "./chromeUtils";
import { getOpenAIApiKeyFromFirestore } from "./firebaseAdmin";

// Cache the API key to avoid too many Firestore reads
let cachedApiKey: string | null = null;
let lastFetchTime = 0;
const CACHE_EXPIRY = 30 * 60 * 1000; // 30 minutes in milliseconds

// API key handling
export const getApiKey = (): string | null => {
  // First try to use cached API key
  if (cachedApiKey) {
    return cachedApiKey;
  }
  
  // Then check user's own key from localStorage
  const userApiKey = localStorage.getItem("openai_api_key");
  if (userApiKey) {
    return userApiKey;
  }
  
  // Return null if no key is available yet
  return null;
};

export const setApiKey = (key: string): void => {
  localStorage.setItem("openai_api_key", key);
  localStorage.setItem("openai_api_key_validated", "true");
  toast.success("API key saved successfully.");
};

export const clearApiKey = (): void => {
  localStorage.removeItem("openai_api_key");
  localStorage.removeItem("openai_api_key_validated");
  cachedApiKey = null; // Also clear the cached API key
  toast.info("API key removed.");
};

export const setApiKeyValidated = (isValid: boolean): void => {
  localStorage.setItem("openai_api_key_validated", isValid ? "true" : "false");
};

export const isApiKeyValidated = (): boolean => {
  return localStorage.getItem("openai_api_key_validated") === "true";
};

// Fetch API key from Firebase with improved error handling and retries
export const fetchApiKeyFromFirestore = async (forceRefresh = false): Promise<string | null> => {
  try {
    const now = Date.now();
    
    // Use cached key if available and not expired, unless force refresh is requested
    if (cachedApiKey && now - lastFetchTime < CACHE_EXPIRY && !forceRefresh) {
      console.log("Using cached Firebase API key");
      return cachedApiKey;
    }
    
    console.log("Fetching API key from Firestore...");
    
    // Get the API key directly from our dedicated function
    const apiKey = await getOpenAIApiKeyFromFirestore();
    
    if (apiKey) {
      cachedApiKey = apiKey;
      lastFetchTime = now;
      console.log("API key successfully fetched from Firestore");
      return cachedApiKey;
    }
    
    console.log("No API key found in Firestore");
    return null;
  } catch (error) {
    console.error("Error fetching API key from Firestore:", error);
    return null;
  }
};

// Modified validate function that checks Firebase key first
export const validateApiKey = async (): Promise<boolean> => {
  try {
    // First try to get Firebase key
    const firebaseKey = await fetchApiKeyFromFirestore(true);
    
    if (firebaseKey) {
      cachedApiKey = firebaseKey;
      console.log("Using Firebase API key for validation");
      return true; // Skip validation for Firebase key to reduce API calls
    }
    
    // Fall back to user's API key if no Firebase key
    const userApiKey = getApiKey();
    if (!userApiKey) {
      return false;
    }
    
    // Only validate user-provided keys
    const response = await fetch("https://api.openai.com/v1/models", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${userApiKey}`,
        "Content-Type": "application/json"
      },
      signal: AbortSignal.timeout(5000) // 5-second timeout
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("API validation failed:", errorText);
      setApiKeyValidated(false);
      return false;
    }
    
    setApiKeyValidated(true);
    return true;
  } catch (error) {
    console.error("Error validating API key:", error);
    setApiKeyValidated(false);
    return false;
  }
};

export const getAIResponse = async (message: string): Promise<string> => {
  // Always try to get a fresh Firebase key first
  const firebaseKey = await fetchApiKeyFromFirestore(true);
  
  if (firebaseKey) {
    try {
      console.log("Using Firebase API key for OpenAI request");
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${firebaseKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { 
              role: "system", 
              content: "You are a helpful assistant focused on productivity and well-being. Keep your responses concise and practical."
            },
            { role: "user", content: message }
          ],
          max_tokens: 500,
          temperature: 0.7
        }),
        signal: AbortSignal.timeout(15000) // 15-second timeout
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("OpenAI API error with Firebase key:", errorText);
        throw new Error(`OpenAI API error: ${errorText}`);
      }
      
      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error("Error using Firebase API key:", error);
      
      // Fall back to user API key if Firebase key fails
      const userApiKey = getApiKey();
      if (userApiKey) {
        return useUserApiKey(message, userApiKey);
      }
      
      return getFallbackResponse(message);
    }
  }
  
  // Second priority: User provided key
  const userApiKey = getApiKey();
  if (userApiKey) {
    return useUserApiKey(message, userApiKey);
  }
  
  // Third priority: Try server API
  try {
    console.log("No API key available, using server fallback");
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message }),
      signal: AbortSignal.timeout(5000)
    });
    
    if (!response.ok) {
      return getFallbackResponse(message);
    }
    
    const data = await response.json();
    return data.content;
  } catch (error) {
    console.error("Server fallback failed:", error);
    return getFallbackResponse(message);
  }
};

// Helper function to use user-provided API key
const useUserApiKey = async (message: string, apiKey: string): Promise<string> => {
  try {
    console.log("Using user-provided API key");
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { 
            role: "system", 
            content: "You are a helpful assistant focused on productivity and well-being. Keep your responses concise and practical."
          },
          { role: "user", content: message }
        ],
        max_tokens: 500,
        temperature: 0.7
      }),
      signal: AbortSignal.timeout(10000)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error with user key:", errorText);
      return getFallbackResponse(message);
    }
    
    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("Error using user API key:", error);
    return getFallbackResponse(message);
  }
};

// Fallback responses when API is unavailable or no key is provided
function getFallbackResponse(message: string): string {
  // For simple questions, provide standard responses
  if (message.toLowerCase().includes("hello") || message.toLowerCase().includes("hi")) {
    return "Hello! I'm your productivity assistant. How can I help you today?";
  }
  
  if (message.toLowerCase().includes("how are you")) {
    return "I'm functioning well and ready to help you with your productivity needs!";
  }
  
  if (message.toLowerCase().includes("thank")) {
    return "You're welcome! Feel free to ask if you need more assistance.";
  }
  
  // For other queries, return a random fallback response
  const fallbackResponses = [
    "I'm here to help you stay focused and productive. What would you like assistance with today?",
    "Having a productive day? I can suggest techniques to help you maintain focus.",
    "Looking for a productivity tip? Regular breaks can actually improve your overall focus and output.",
    "Need help organizing your tasks? I recommend prioritizing them by importance and urgency.",
    "Remember that taking short breaks during focused work can help prevent burnout and maintain productivity.",
    "Is there something specific about productivity or focus that you'd like to learn more about?",
    "The Pomodoro Technique involves 25-minute focused work sessions followed by 5-minute breaks. Would you like to try it?",
    "Setting clear goals for each work session can significantly improve your productivity and focus.",
    "I'm here to support your productivity journey. What challenges are you facing today?",
    "Sometimes a change of environment can help refresh your focus. Have you tried working from a different location?"
  ];
  
  const randomIndex = Math.floor(Math.random() * fallbackResponses.length);
  return fallbackResponses[randomIndex];
}
