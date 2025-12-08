
import { useEffect, useCallback } from 'react';
import { liveBridge } from '../services/geminiLiveBridge';
import { useAppStore } from '../store/appStore';
import { AccessibilityMode } from '../types';

export const useGeminiLive = () => {
  const { liveState, setAccessibilityMode } = useAppStore();

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

  // Video Frame Capture Loop
  useEffect(() => {
    if (!liveState.isConnected) return;

    // Capture screen/video at 1 FPS for context
    const interval = setInterval(() => {
      // In a real implementation, we'd grab the video element ref here
      // liveBridge.sendVideoFrame(base64);
      // For now, this is a placeholder for the integration
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
