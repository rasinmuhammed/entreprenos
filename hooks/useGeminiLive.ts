
import { useEffect, useCallback, useRef } from 'react';
import { liveBridge } from '../services/geminiLiveBridge';
import { useAppStore } from '../store/appStore';
import { AccessibilityMode } from '../types';
import { scanShelf } from '../services/vision/inventoryScanner';

export const useGeminiLive = () => {
  const { liveState, setAccessibilityMode, accessibilityMode, context, setInventoryAlerts } = useAppStore();
  
  // Refs for timers
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(async (persona: 'Standard' | 'Helpful' | 'Direct' = 'Standard') => {
    await liveBridge.connect({
      voiceName: 'Kore',
      systemInstruction: `
        You are EntreprenOS Access Edition. 
        Current Accessibility Mode: ${useAppStore.getState().accessibilityMode}.
        
        CRITICAL RULES:
        1. IF user speaks slowly or stutters -> SWITCH to FOCUS_SHIELD mode.
        2. IF user mentions "can't see" -> SWITCH to SONIC_VIEW mode.
        3. IF user seems overwhelmed -> Simplify language.
        
        You have tools to update the UI. Use them.
      `
    });
  }, []);

  const disconnect = useCallback(async () => {
    await liveBridge.disconnect();
  }, []);

  // --- FEATURE: BODY DOUBLE MONITOR (Focus Shield) ---
  useEffect(() => {
    if (accessibilityMode !== AccessibilityMode.FOCUS_SHIELD || !liveState.isConnected) {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      return;
    }

    // If volume is low (< 0.01) for 45s, nudge user
    if (liveState.volumeLevel < 0.01) {
       if (!silenceTimerRef.current) {
         silenceTimerRef.current = setTimeout(() => {
            const currentStep = useAppStore.getState().focusSession.microSteps[useAppStore.getState().focusSession.currentStepIndex];
            const task = currentStep ? currentStep.text : "your task";
            liveBridge.sendText(`The user has been silent for 45 seconds. Nudge them gently to get back to: ${task}`);
         }, 45000);
       }
    } else {
       // Reset if noise detected
       if (silenceTimerRef.current) {
         clearTimeout(silenceTimerRef.current);
         silenceTimerRef.current = null;
       }
    }

    return () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    };
  }, [liveState.volumeLevel, accessibilityMode, liveState.isConnected]);

  // --- FEATURE: INVENTORY SONAR (Sonic View) ---
  // Note: This relies on a video stream being available. In a real app, we'd grab frames from the `useMultimodalInput` hook or similar.
  // For this demo, we assume we can snapshot the video element if it exists in the DOM, or we skip if no video.
  useEffect(() => {
    if (accessibilityMode !== AccessibilityMode.SONIC_VIEW || !liveState.isConnected || !context) {
       if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
       return;
    }

    // Scan every 10 seconds
    scanIntervalRef.current = setInterval(async () => {
       // Mock capturing a frame from the global video element if it exists
       // In production, pass the video ref properly
       const videoEl = document.querySelector('video');
       if (videoEl && !videoEl.paused) {
          const canvas = document.createElement('canvas');
          canvas.width = videoEl.videoWidth;
          canvas.height = videoEl.videoHeight;
          canvas.getContext('2d')?.drawImage(videoEl, 0, 0);
          const base64 = canvas.toDataURL('image/jpeg').split(',')[1];
          
          const alerts = await scanShelf(base64, context);
          if (alerts.length > 0) {
             setInventoryAlerts(alerts);
             // Announce alerts via Live API
             const alertText = alerts.map(a => `${a.item} is ${a.status} at count ${a.currentCount}`).join('. ');
             liveBridge.sendText(`Alert the user: ${alertText}`);
          }
       }
    }, 10000);

    return () => {
      if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
    };
  }, [accessibilityMode, liveState.isConnected, context]);

  // Video Frame Capture Loop for Context (General)
  useEffect(() => {
    if (!liveState.isConnected) return;
    const interval = setInterval(() => {
       // liveBridge.sendVideoFrame(base64);
    }, 1000);
    return () => clearInterval(interval);
  }, [liveState.isConnected]);

  return {
    connect,
    disconnect,
    isConnected: liveState.isConnected,
    isStreaming: liveState.isStreaming,
    volume: liveState.volumeLevel
  };
};
