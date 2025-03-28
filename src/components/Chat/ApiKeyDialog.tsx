
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getApiKey, setApiKey, clearApiKey, validateApiKey, fetchApiKeyFromFirestore } from "@/utils/openaiUtils";
import { toast } from "sonner";
import { Key, Trash, Info, Database, CheckCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { setOpenAIApiKeyInFirestore, checkOpenAIApiKeyInFirestore } from "@/utils/firebaseAdmin";

interface ApiKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onKeyStoredInFirebase?: () => void;
}

const ApiKeyDialog: React.FC<ApiKeyDialogProps> = ({ 
  open, 
  onOpenChange,
  onKeyStoredInFirebase 
}) => {
  const [apiKey, setApiKeyState] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [firebaseKeyAvailable, setFirebaseKeyAvailable] = useState(false);
  const [firebaseSetupKey, setFirebaseSetupKey] = useState("");
  const [isFirebaseSetup, setIsFirebaseSetup] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  
  // Check if Firebase key is available when dialog opens
  useEffect(() => {
    if (open) {
      const checkFirebaseKey = async () => {
        setCheckingStatus(true);
        try {
          // First check if a key exists in Firestore
          const keyExists = await checkOpenAIApiKeyInFirestore();
          
          if (keyExists) {
            // If it exists, fetch it to confirm we can access it
            const key = await fetchApiKeyFromFirestore(true);
            setFirebaseKeyAvailable(!!key);
            
            if (key) {
              console.log("API key successfully retrieved from Firebase");
            } else {
              console.error("Firebase key exists but couldn't be retrieved. Check Firebase security rules.");
            }
          } else {
            setFirebaseKeyAvailable(false);
            console.log("No API key found in Firebase. Please set one up using the Admin section.");
          }
          
          // Only set the input state if user has their own key
          const userKey = getApiKey();
          if (userKey && localStorage.getItem("openai_api_key")) {
            setApiKeyState(userKey);
          } else {
            setApiKeyState("");
          }
        } catch (error) {
          console.error("Error checking Firebase key:", error);
          setFirebaseKeyAvailable(false);
        } finally {
          setCheckingStatus(false);
        }
      };
      
      checkFirebaseKey();
    }
  }, [open]);
  
  const handleSaveKey = async () => {
    if (!apiKey.trim()) {
      toast.error("Please enter an API key");
      return;
    }
    
    setIsValidating(true);
    
    try {
      setApiKey(apiKey.trim());
      const isValid = await validateApiKey();
      
      if (isValid) {
        toast.success("API key validated successfully");
        onOpenChange(false);
      } else {
        toast.error("Invalid API key. Please check and try again.");
      }
    } catch (error) {
      toast.error("Error validating API key");
      console.error("Error:", error);
    } finally {
      setIsValidating(false);
    }
  };
  
  const handleSetupFirebaseKey = async () => {
    if (!firebaseSetupKey.trim()) {
      toast.error("Please enter an API key for Firebase");
      return;
    }
    
    setIsFirebaseSetup(true);
    
    try {
      await setOpenAIApiKeyInFirestore(firebaseSetupKey.trim());
      
      // Wait a moment for Firestore to update
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Verify the key was stored successfully
      const keyExists = await checkOpenAIApiKeyInFirestore();
      
      if (keyExists) {
        const key = await fetchApiKeyFromFirestore(true);
        
        if (key) {
          toast.success("API key successfully stored in Firebase");
          setFirebaseKeyAvailable(true);
          setFirebaseSetupKey("");
          
          // Notify parent component
          if (onKeyStoredInFirebase) {
            onKeyStoredInFirebase();
          }
          
          // Close the dialog after success
          setTimeout(() => onOpenChange(false), 1500);
        } else {
          toast.warning("Key stored but couldn't be retrieved. Check Firestore security rules.");
        }
      } else {
        toast.error("Failed to store key in Firebase. Check console for details.");
      }
    } catch (error) {
      console.error("Error storing API key in Firebase:", error);
      toast.error("Error storing API key in Firebase. Check console for details.");
    } finally {
      setIsFirebaseSetup(false);
    }
  };
  
  const handleRemoveKey = () => {
    clearApiKey();
    setApiKeyState("");
    
    if (firebaseKeyAvailable) {
      toast.info("Your custom API key was removed. The app will now use the provided API key.");
    } else {
      toast.info("API key removed. The chat will use fallback responses.");
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>OpenAI API Key</DialogTitle>
          <DialogDescription>
            {firebaseKeyAvailable 
              ? "This app already has an API key configured. You only need to enter your own if you want to use your personal key."
              : "Enter your OpenAI API key to enable AI chat functionality. Your key stays in your browser and is never sent to our servers."}
          </DialogDescription>
        </DialogHeader>
        
        {checkingStatus ? (
          <div className="flex items-center justify-center py-6">
            <div className="flex flex-col items-center space-y-2">
              <Loader2 className="h-8 w-8 animate-spin text-focus-purple" />
              <p className="text-sm text-muted-foreground">Checking API key status...</p>
            </div>
          </div>
        ) : (
          <>
            {firebaseKeyAvailable ? (
              <Alert className="bg-green-50 text-green-800 border-green-200">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  A default API key is configured for this app. You don't need to add your own key.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert className="bg-amber-50 text-amber-800 border-amber-200">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  No API key is available in Firebase. App administrators should use the setup form below.
                </AlertDescription>
              </Alert>
            )}
            
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <label htmlFor="apiKey" className="text-sm font-medium">Your Personal OpenAI API Key (Optional)</label>
                <Input
                  id="apiKey"
                  type="password"
                  placeholder="sk-..."
                  value={apiKey}
                  onChange={(e) => setApiKeyState(e.target.value)}
                  className="col-span-3"
                />
                <p className="text-xs text-muted-foreground">
                  Get your key at{" "}
                  <a 
                    href="https://platform.openai.com/account/api-keys" 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-focus-purple hover:underline"
                  >
                    platform.openai.com
                  </a>
                </p>
              </div>
            </div>
            
            <DialogFooter className="flex justify-between items-center sm:justify-between">
              <Button
                type="button"
                variant="outline"
                disabled={isValidating || (!getApiKey() && !localStorage.getItem("openai_api_key"))}
                onClick={handleRemoveKey}
                className="gap-2"
              >
                <Trash size={16} />
                Remove Key
              </Button>
              
              <Button 
                type="submit" 
                disabled={isValidating || !apiKey.trim()}
                onClick={handleSaveKey}
                className="gap-2 bg-focus-purple hover:bg-focus-purple-dark"
              >
                <Key size={16} />
                {isValidating ? "Validating..." : "Save Key"}
              </Button>
            </DialogFooter>
            
            {/* Admin Firebase Setup Section */}
            <div className="pt-4 mt-4 border-t">
              <h3 className="text-sm font-medium mb-2">Admin Setup (Firebase API Key)</h3>
              <div className="space-y-4">
                <p className="text-xs text-muted-foreground">
                  For app administrators only: Store the OpenAI API key in Firebase to provide it to all users.
                </p>
                
                <div className="flex gap-2">
                  <Input
                    type="password"
                    placeholder="Enter OpenAI API key for Firebase"
                    value={firebaseSetupKey}
                    onChange={(e) => setFirebaseSetupKey(e.target.value)}
                  />
                  <Button
                    type="button"
                    disabled={isFirebaseSetup || !firebaseSetupKey.trim()}
                    onClick={handleSetupFirebaseKey}
                    className="gap-2 whitespace-nowrap"
                    variant="outline"
                  >
                    <Database size={16} />
                    {isFirebaseSetup ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-1" />
                        Saving...
                      </>
                    ) : (
                      "Store in Firebase"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ApiKeyDialog;
