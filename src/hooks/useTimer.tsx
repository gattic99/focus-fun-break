import { useState, useEffect, useCallback, useRef } from "react";
import { TimerMode, TimerState, BreakActivity, TimerSettings } from "@/types";
import { toast } from "sonner";
import { minutesToSeconds } from "@/utils/timerUtils";
import { 
  isExtensionContext, 
  getExtensionURL, 
  saveToLocalStorage,
  getFromLocalStorage,
  listenForStateChanges,
  playSingleAudio
} from "@/utils/chromeUtils";
import { v4 as uuidv4 } from 'uuid';

interface UseTimerProps {
  settings: TimerSettings;
}

// Timer state keys for storage
const TIMER_STATE_KEY = "focusflow_timer_state";
const TIMER_LAST_UPDATE_KEY = "focusflow_timer_last_update";
const SETTINGS_KEY = "focusflow_settings";

export const useTimer = ({ settings }: UseTimerProps) => {
  // Always initialize with focus mode
  const [timerState, setTimerState] = useState<TimerState>({
    mode: "focus",
    timeRemaining: minutesToSeconds(settings.focusDuration),
    isRunning: false,
    breakActivity: null,
    completed: false,
  });

  // Keep a ref to the current settings to avoid dependency issues in hooks
  const settingsRef = useRef(settings);
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  const intervalRef = useRef<number | null>(null);
  const breakAudioRef = useRef<HTMLAudioElement | null>(null);
  const focusAudioRef = useRef<HTMLAudioElement | null>(null);
  
  // Keep track of when the state last changed
  const lastUpdateRef = useRef<number>(Date.now());

  // Initialize audio with lower volume and lazy loading
  useEffect(() => {
    // Lazy initialize audio elements
    const initAudio = () => {
      if (!breakAudioRef.current) {
        breakAudioRef.current = new Audio(getExtensionURL("/assets/time-for-break.mp3"));
        breakAudioRef.current.volume = 0.7; // Lower volume
      }
      
      if (!focusAudioRef.current) {
        focusAudioRef.current = new Audio(getExtensionURL("/assets/time-for-focus.mp3"));
        focusAudioRef.current.volume = 0.7; // Lower volume
      }
    };
    
    // Delay audio initialization
    const timeoutId = setTimeout(initAudio, 1000);

    return () => {
      clearTimeout(timeoutId);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Load initial timer state from storage
  useEffect(() => {
    const loadStoredTimerState = async () => {
      if (!isExtensionContext()) return;
      
      try {
        const storedState = await getFromLocalStorage<TimerState>(TIMER_STATE_KEY);
        const lastUpdate = await getFromLocalStorage<number>(TIMER_LAST_UPDATE_KEY);
        const storedSettings = await getFromLocalStorage<TimerSettings>(SETTINGS_KEY);
        
        // Update our settings ref if we have stored settings
        if (storedSettings) {
          settingsRef.current = storedSettings;
        }
        
        if (storedState && lastUpdate) {
          // Adjust remaining time based on how long it's been since the last update
          if (storedState.isRunning) {
            const elapsedSeconds = Math.floor((Date.now() - lastUpdate) / 1000);
            storedState.timeRemaining = Math.max(0, storedState.timeRemaining - elapsedSeconds);
            
            // Check if timer would have completed while we were away
            if (storedState.timeRemaining <= 0) {
              // Handle timer completion
              const nextMode = storedState.mode === 'focus' ? 'break' : 'focus';
              const nextDuration = nextMode === 'focus' 
                ? minutesToSeconds(settingsRef.current.focusDuration)
                : minutesToSeconds(settingsRef.current.breakDuration);
                
              storedState.mode = nextMode;
              storedState.timeRemaining = nextDuration;
              storedState.isRunning = false;
              storedState.completed = true;
            }
          }
          
          // If no stored state or if it's in a completed break state, reset to focus mode
          if (!storedState || (storedState.mode === 'break' && storedState.completed)) {
            setTimerState({
              mode: "focus",
              timeRemaining: minutesToSeconds(settingsRef.current.focusDuration),
              isRunning: false,
              breakActivity: null,
              completed: false,
            });
          } else {
            setTimerState(storedState);
          }
          
          lastUpdateRef.current = Date.now();
        }
      } catch (error) {
        console.error("Error loading timer state:", error);
        // Fallback to focus mode on error
        setTimerState({
          mode: "focus",
          timeRemaining: minutesToSeconds(settingsRef.current.focusDuration),
          isRunning: false,
          breakActivity: null,
          completed: false,
        });
      }
    };
    
    loadStoredTimerState();
  }, []);
  
  // Listen for timer state changes from other tabs
  useEffect(() => {
    if (!isExtensionContext()) return;
    
    // Listen for timer state changes
    const unsubscribe = listenForStateChanges((key, value) => {
      if (key === TIMER_STATE_KEY && value) {
        setTimerState(value);
        
        // If timer is running, stop our local interval as another tab is managing it
        if (value.isRunning && intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        
        // If timer just completed, handle sound
        if (value.completed && !timerState.completed) {
          if (value.mode === 'focus') {
            playSingleAudio(focusAudioRef.current, 'focus_complete');
            toast("Break complete! Ready to focus again?");
          } else {
            playSingleAudio(breakAudioRef.current, 'break_complete');
            toast("Focus session complete! Time for a break.");
          }
        }
      }
      
      // Listen for settings changes
      if (key === SETTINGS_KEY && value) {
        settingsRef.current = value;
      }
    });
    
    return unsubscribe;
  }, [timerState]);

  // Save timer state when it changes
  useEffect(() => {
    const saveTimerState = async () => {
      if (!isExtensionContext()) return;
      
      try {
        await saveToLocalStorage(TIMER_STATE_KEY, timerState);
        await saveToLocalStorage(TIMER_LAST_UPDATE_KEY, Date.now());
        lastUpdateRef.current = Date.now();
      } catch (error) {
        console.error("Error saving timer state:", error);
      }
    };
    
    saveTimerState();
  }, [timerState]);

  const resetTimer = useCallback(
    (mode: TimerMode) => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      const newState = {
        mode,
        timeRemaining:
          mode === "focus"
            ? minutesToSeconds(settingsRef.current.focusDuration)
            : minutesToSeconds(settingsRef.current.breakDuration),
        isRunning: false,
        breakActivity: null,
        completed: false,
      };
      
      setTimerState(newState);
    },
    []
  );

  const startTimer = useCallback(() => {
    if (timerState.isRunning) return;

    if (timerState.timeRemaining <= 0) {
      // Reset timer if it's at 0
      resetTimer(timerState.mode);
    }

    const newState = { ...timerState, isRunning: true, completed: false };
    setTimerState(newState);

    // Clear any existing interval before setting a new one
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = window.setInterval(() => {
      setTimerState((prev) => {
        if (prev.timeRemaining <= 1) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }

          // Play notification sound when timer completes, but only from one tab
          if (prev.mode === "focus") {
            playSingleAudio(breakAudioRef.current, 'break_start');
            toast("Focus session complete! Time for a break.");

            // Switch to break mode
            return {
              ...prev,
              mode: "break",
              timeRemaining: minutesToSeconds(settingsRef.current.breakDuration),
              isRunning: false,
              completed: true,
            };
          } else {
            playSingleAudio(focusAudioRef.current, 'focus_start');
            toast("Break complete! Ready to focus again?");

            // Switch to focus mode
            return {
              ...prev,
              mode: "focus",
              timeRemaining: minutesToSeconds(settingsRef.current.focusDuration),
              isRunning: false,
              breakActivity: null,
              completed: true,
            };
          }
        }

        return {
          ...prev,
          timeRemaining: prev.timeRemaining - 1,
          completed: false,
        };
      });
    }, 1000);
  }, [
    timerState.isRunning,
    timerState.timeRemaining,
    timerState.mode,
    resetTimer,
  ]);

  const pauseTimer = useCallback(() => {
    if (!timerState.isRunning) return;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setTimerState((prev) => ({ ...prev, isRunning: false }));
  }, [timerState.isRunning]);

  const selectBreakActivity = useCallback(
    (activity: BreakActivity) => {
      setTimerState((prev) => ({ ...prev, breakActivity: activity }));
      // Auto-start the timer when an activity is selected
      if (activity && !timerState.isRunning) {
        setTimeout(() => startTimer(), 100); // Small timeout to ensure state updates first
      }
    },
    [timerState.isRunning, startTimer]
  );

  const updateFocusDuration = useCallback(
    (minutes: number) => {
      if (!timerState.isRunning && timerState.mode === "focus") {
        setTimerState((prev) => ({
          ...prev,
          timeRemaining: minutesToSeconds(minutes),
        }));
      }
    },
    [timerState.isRunning, timerState.mode]
  );

  const updateBreakDuration = useCallback(
    (minutes: number) => {
      if (!timerState.isRunning && timerState.mode === "break") {
        setTimerState((prev) => ({
          ...prev,
          timeRemaining: minutesToSeconds(minutes),
        }));
      }
    },
    [timerState.isRunning, timerState.mode]
  );

  return {
    timerState,
    startTimer,
    pauseTimer,
    resetTimer,
    selectBreakActivity,
    updateFocusDuration,
    updateBreakDuration,
  };
};
