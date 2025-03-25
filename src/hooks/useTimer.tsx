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

  // Load initial timer state from storage with improved sync
  useEffect(() => {
    const loadStoredTimerState = async () => {
      if (!isExtensionContext()) return;
      
      try {
        const storedState = await getFromLocalStorage<TimerState>(TIMER_STATE_KEY);
        const lastUpdate = await getFromLocalStorage<number>(TIMER_LAST_UPDATE_KEY);
        const storedSettings = await getFromLocalStorage<TimerSettings>(SETTINGS_KEY);
        
        if (storedSettings) {
          settingsRef.current = storedSettings;
        }
        
        if (storedState && lastUpdate) {
          // Calculate elapsed time more accurately
          const elapsedSeconds = Math.floor((Date.now() - lastUpdate) / 1000);
          
          if (storedState.isRunning) {
            storedState.timeRemaining = Math.max(0, storedState.timeRemaining - elapsedSeconds);
            
            // Check if timer would have completed
            if (storedState.timeRemaining <= 0) {
              handleTimerCompletion(storedState.mode);
            } else {
              // Continue running timer
              setTimerState(storedState);
              if (!intervalRef.current) {
                startTimerInterval();
              }
            }
          } else {
            setTimerState(storedState);
          }
          
          lastUpdateRef.current = Date.now();
        }
      } catch (error) {
        console.error("Error loading timer state:", error);
      }
    };
    
    loadStoredTimerState();
    
    // Sync timer across tabs when visibility changes
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadStoredTimerState();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Helper function to start timer interval
  const startTimerInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = window.setInterval(() => {
      setTimerState((prev) => {
        if (prev.timeRemaining <= 1) {
          return handleTimerCompletion(prev.mode);
        }

        const newState = {
          ...prev,
          timeRemaining: prev.timeRemaining - 1,
          completed: false,
        };

        // Save state more frequently for better sync
        saveToLocalStorage(TIMER_STATE_KEY, newState);
        saveToLocalStorage(TIMER_LAST_UPDATE_KEY, Date.now());

        return newState;
      });
    }, 1000);
  }, []);

  // Handle timer completion with proper TypeScript types
  const handleTimerCompletion = (currentMode: TimerMode): TimerState => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    const nextMode: TimerMode = currentMode === "focus" ? "break" : "focus";
    const nextDuration = nextMode === "focus" 
      ? minutesToSeconds(settingsRef.current.focusDuration)
      : minutesToSeconds(settingsRef.current.breakDuration);

    // Play sound and show notification
    if (currentMode === "focus") {
      playSingleAudio(breakAudioRef.current, 'break_start');
      toast("Focus session complete! Time for a break.");
    } else {
      playSingleAudio(focusAudioRef.current, 'focus_start');
      toast("Break complete! Ready to focus again?");
    }

    const newState: TimerState = {
      mode: nextMode,
      timeRemaining: nextDuration,
      isRunning: false,
      breakActivity: null,
      completed: true,
    };

    // Ensure state is saved when timer completes
    saveToLocalStorage(TIMER_STATE_KEY, newState);
    saveToLocalStorage(TIMER_LAST_UPDATE_KEY, Date.now());

    return newState;
  };

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
      resetTimer(timerState.mode);
      return;
    }

    const newState = { ...timerState, isRunning: true, completed: false };
    setTimerState(newState);
    
    // Save state when starting timer
    saveToLocalStorage(TIMER_STATE_KEY, newState);
    saveToLocalStorage(TIMER_LAST_UPDATE_KEY, Date.now());
    
    startTimerInterval();
  }, [timerState, resetTimer, startTimerInterval]);

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
