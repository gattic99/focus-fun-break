
import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button"; // Add Button import
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
import PlatformerGame from "@/components/PlatformerGame";

const Index: React.FC = () => {
  const [settings, setSettings] = useState<TimerSettings>(defaultTimerSettings);
  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [gameError, setGameError] = useState<string | null>(null);

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
    
    // Check if Phaser is available
    if (typeof window !== 'undefined') {
      if (!window.Phaser) {
        console.warn("Phaser not detected on window object");
      } else {
        console.log("Phaser detected on window object:", window.Phaser);
      }
    }
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
    setIsChatOpen(false);
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
    console.log("Returning from game to break mode");
    selectBreakActivity(null);
    setGameError(null);
  };

  const handleOpenChat = () => {
    setIsChatOpen(true);
    setIsTimerOpen(false);
  };

  const handleCloseChat = () => {
    setIsChatOpen(false);
  };

  // Use a more resilient approach for the game state
  const renderGameComponent = () => {
    console.log("Rendering game component with timerState:", timerState);
    try {
      return (
        <div className="w-full max-w-[800px] mx-auto p-4">
          <PlatformerGame 
            onReturn={handleReturnFromGame} 
            timerState={timerState} 
            onStart={startTimer} 
            onPause={pauseTimer} 
          />
        </div>
      );
    } catch (err) {
      console.error("Error rendering game component:", err);
      setGameError(err.message);
      // Fallback content when game rendering fails
      return (
        <div className="w-full max-w-[800px] mx-auto p-4 text-center">
          <h2 className="text-xl font-bold mb-2">Game Loading Error</h2>
          <p className="text-red-500 mb-4">{err.message}</p>
          <Button onClick={handleReturnFromGame}>
            Return to Break Timer
          </Button>
        </div>
      );
    }
  };

  if (timerState.mode === 'break' && timerState.breakActivity === 'game') {
    console.log("Index rendering PlatformerGame directly");
    return renderGameComponent();
  }

  return (
    <div>
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
    </div>
  );
};

export default Index;
