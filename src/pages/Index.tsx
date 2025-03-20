
import React, { useState, useEffect, Suspense } from "react";
import { Card } from "@/components/ui/card";
import { defaultTimerSettings } from "@/utils/timerUtils";
import { useTimer } from "@/hooks/useTimer";
import FocusMode from "@/components/FocusMode";
import BreakMode from "@/components/BreakMode";
import { TimerSettings } from "@/types";
import { X } from "lucide-react";
import FloatingTimer from "@/components/FloatingTimer";
import ChatBubble from "@/components/Chat/ChatBubble";
import { saveToLocalStorage, getFromLocalStorage, isExtensionContext } from "@/utils/chromeUtils";
import { toast } from "sonner";

// Lazy load the PlatformerGame component to avoid circular dependencies
const PlatformerGame = React.lazy(() => import("@/components/PlatformerGame"));

const Index: React.FC = () => {
  // Initialize with default settings (25 min focus, 5 min break)
  const [settings, setSettings] = useState<TimerSettings>(defaultTimerSettings);
  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Load settings from storage on initial render
  useEffect(() => {
    const loadSettings = async () => {
      if (isExtensionContext()) {
        try {
          const storedSettings = await getFromLocalStorage<TimerSettings>('focusflow_settings');
          if (storedSettings) {
            console.log("Loaded settings from storage:", storedSettings);
            setSettings(storedSettings);
          } else {
            console.log("No stored settings found, using defaults:", defaultTimerSettings);
          }
        } catch (error) {
          console.error("Error loading settings:", error);
          console.log("Using default settings instead:", defaultTimerSettings);
        }
      }
    };
    
    loadSettings();
  }, []);

  const {
    timerState,
    startTimer,
    pauseTimer,
    resetTimer,
    selectBreakActivity,
    updateFocusDuration,
    updateBreakDuration
  } = useTimer({
    settings
  });

  // Debug log to track timer state changes in Index component
  useEffect(() => {
    console.log("Index component - timerState updated:", {
      mode: timerState.mode,
      isRunning: timerState.isRunning,
      timeRemaining: timerState.timeRemaining,
      breakActivity: timerState.breakActivity,
      completed: timerState.completed
    });
  }, [timerState]);

  useEffect(() => {
    if (timerState.mode === 'break' && timerState.completed) {
      openTimerPopup();
    }
  }, [timerState.mode, timerState.completed]);

  const handleFocusDurationChange = async (newDuration: number) => {
    console.log("Changing focus duration to:", newDuration);
    const newSettings = {
      ...settings,
      focusDuration: newDuration
    };
    setSettings(newSettings);
    updateFocusDuration(newDuration);
    
    // Save settings to Chrome storage and notify background script
    if (isExtensionContext()) {
      try {
        await saveToLocalStorage('focusflow_settings', newSettings);
        chrome.runtime.sendMessage({
          action: 'updateSettings',
          settings: newSettings
        });
        console.log("Focus duration saved:", newDuration);
      } catch (error) {
        console.error("Error saving focus duration:", error);
      }
    }
  };

  const handleBreakDurationChange = async (newDuration: number) => {
    console.log("Setting break duration to:", newDuration);
    const newSettings = {
      ...settings,
      breakDuration: newDuration
    };
    setSettings(newSettings);
    updateBreakDuration(newDuration);
    
    // Save settings to Chrome storage and notify background script
    if (isExtensionContext()) {
      try {
        await saveToLocalStorage('focusflow_settings', newSettings);
        chrome.runtime.sendMessage({
          action: 'updateSettings',
          settings: newSettings
        });
        console.log("Break duration saved:", newDuration);
        toast.success(`Break duration set to ${newDuration} minutes`);
      } catch (error) {
        console.error("Error saving break duration:", error);
        toast.error("Failed to save break duration");
      }
    }
  };

  const openTimerPopup = () => {
    setIsTimerOpen(true);
    setIsChatOpen(false); // Close chat when timer is opened
  };

  const closeTimerPopup = () => {
    setIsTimerOpen(false);
  };

  const handleStartTimer = () => {
    console.log("Starting timer...");
    startTimer();
    toast.success("Timer started!");
    if (timerState.mode === 'focus') {
      closeTimerPopup();
    }
  };

  const handlePauseTimer = () => {
    console.log("Pausing timer...");
    pauseTimer();
    toast.info("Timer paused");
  };

  const handleResetTimer = (mode: 'focus' | 'break') => {
    console.log(`Resetting ${mode} timer...`);
    resetTimer(mode);
    toast.info(`${mode.charAt(0).toUpperCase() + mode.slice(1)} timer reset`);
  };

  const handleReturnFromGame = () => {
    console.log("Returning from game activity");
    selectBreakActivity(null);
  };

  // Pass state setters to ChatBubble
  const handleOpenChat = () => {
    setIsChatOpen(true);
    setIsTimerOpen(false); // Close timer when chat is opened
  };

  const handleCloseChat = () => {
    setIsChatOpen(false);
  };

  // Render the appropriate content based on the mode and activity
  const renderContent = () => {
    // Special case for game activity during break
    if (timerState.mode === 'break' && timerState.breakActivity === 'game') {
      console.log("Rendering game activity UI");
      return (
        <div className="fixed inset-0 flex items-center justify-center z-[10000]">
          <div className="bg-black bg-opacity-50 absolute inset-0"></div>
          <Card className="glass-panel w-[800px] max-w-[95vw] p-4 shadow-xl relative z-10">
            <button 
              onClick={handleReturnFromGame} 
              className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-200 z-20"
              aria-label="Close game"
            >
              <X size={18} />
            </button>
            <Suspense fallback={
              <div className="flex flex-col items-center justify-center h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-focus-purple mb-4"></div>
                <p className="text-focus-purple">Loading game...</p>
              </div>
            }>
              <PlatformerGame 
                onReturn={handleReturnFromGame} 
                timerState={timerState} 
                onStart={startTimer} 
                onPause={pauseTimer} 
              />
            </Suspense>
          </Card>
        </div>
      );
    }

    // Default interface with timer
    return (
      <>
        <ChatBubble 
          isOpen={isChatOpen}
          onOpen={handleOpenChat}
          onClose={handleCloseChat}
        />
        
        <FloatingTimer 
          isOpen={isTimerOpen} 
          timerState={timerState} 
          togglePopup={openTimerPopup} 
        />
        
        {isTimerOpen && (
          <div className="fixed bottom-24 right-6 z-[10000] animate-scale-in">
            <Card className="glass-panel w-[420px] p-8 shadow-xl px-[24px] py-[24px]">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-focus-purple">FocusFlow</h1>
                  <p className="text-sm text-gray-500 mt-1">Stay focused, take mindful breaks, and boost productivity.</p>
                </div>
                
                <div className="flex space-x-2">
                  <button onClick={closeTimerPopup} className="p-2 rounded-full hover:bg-gray-100" aria-label="Close Timer">
                    <X size={18} />
                  </button>
                </div>
              </div>
              
              {timerState.mode === 'focus' 
                ? <FocusMode 
                    timerState={timerState} 
                    onStart={handleStartTimer} 
                    onPause={handlePauseTimer} 
                    onReset={() => handleResetTimer('focus')} 
                    focusDuration={settings.focusDuration} 
                    breakDuration={settings.breakDuration} 
                    onChangeFocusDuration={handleFocusDurationChange} 
                    onChangeBreakDuration={handleBreakDurationChange} 
                  /> 
                : <BreakMode 
                    timerState={timerState} 
                    onStart={handleStartTimer} 
                    onPause={handlePauseTimer} 
                    onReset={() => handleResetTimer('break')} 
                    onSelectActivity={selectBreakActivity} 
                    breakDuration={settings.breakDuration} 
                    onChangeBreakDuration={handleBreakDurationChange} 
                  />
              }
            </Card>
          </div>
        )}
      </>
    );
  };

  return (
    <div>
      {renderContent()}
    </div>
  );
};

export default Index;
