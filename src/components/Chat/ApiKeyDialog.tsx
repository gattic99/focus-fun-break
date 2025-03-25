
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getApiKey, setApiKey, clearApiKey, validateApiKey } from "@/utils/openaiUtils";
import { toast } from "sonner";
import { Key, Trash } from "lucide-react";

interface ApiKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ApiKeyDialog: React.FC<ApiKeyDialogProps> = ({ open, onOpenChange }) => {
  const [apiKey, setApiKeyState] = useState(getApiKey() || "");
  const [isValidating, setIsValidating] = useState(false);
  
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
  
  const handleRemoveKey = () => {
    clearApiKey();
    setApiKeyState("");
    toast.info("API key removed. The chat will use fallback responses.");
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>OpenAI API Key</DialogTitle>
          <DialogDescription>
            Enter your OpenAI API key to enable AI chat functionality.
            Your key stays in your browser and is never sent to our servers.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
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
            disabled={isValidating || !getApiKey()}
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
      </DialogContent>
    </Dialog>
  );
};

export default ApiKeyDialog;
