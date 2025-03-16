
/**
 * Type definitions for Chrome extension APIs
 */
interface Chrome {
  runtime: {
    id?: string;
    lastError?: {
      message: string;
    };
    getURL(path: string): string;
    getManifest(): {
      version: string;
      name: string;
      description: string;
      [key: string]: any;
    };
    // Add messaging APIs
    sendMessage(message: any, responseCallback?: (response: any) => void): void;
    onMessage: {
      addListener(callback: (message: any, sender: MessageSender, sendResponse: (response?: any) => void) => boolean | void): void;
      removeListener(callback: (message: any, sender: MessageSender, sendResponse: (response?: any) => void) => boolean | void): void;
    };
  };
  storage: {
    sync: {
      get(keys: string | string[] | object | null, callback: (items: { [key: string]: any }) => void): void;
      set(items: object, callback?: () => void): void;
      remove(keys: string | string[], callback?: () => void): void;
      clear(callback?: () => void): void;
    };
    local: {
      get(keys: string | string[] | object | null, callback: (items: { [key: string]: any }) => void): void;
      set(items: object, callback?: () => void): void;
      remove(keys: string | string[], callback?: () => void): void;
      clear(callback?: () => void): void;
    };
  };
  tabs?: {
    query(queryInfo: object, callback: (tabs: any[]) => void): void;
    sendMessage(tabId: number, message: any, responseCallback?: (response: any) => void): void;
  };
}

// Define MessageSender interface
export interface MessageSender {
  tab?: {
    id?: number;
    url?: string;
  };
  frameId?: number;
  id?: string;
  url?: string;
  tlsChannelId?: string;
}

declare global {
  interface Window {
    chrome?: Chrome;
    hasRun?: boolean;
  }
  var chrome: Chrome | undefined;
  var tabId: string;
}

export {};
