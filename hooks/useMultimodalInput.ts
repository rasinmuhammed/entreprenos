
import { useState, useRef, useCallback } from 'react';

export const useMultimodalInput = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  
  const startRecording = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        audio: true, 
        video: { facingMode: "user", width: 640, height: 480 } 
      });
      setStream(mediaStream);
      
      const recorder = new MediaRecorder(mediaStream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing media devices:", err);
    }
  }, []);

  const stopRecording = useCallback(async (): Promise<{ audioBlob: Blob, videoBlob: Blob } | null> => {
    if (!mediaRecorderRef.current) return null;

    return new Promise((resolve) => {
      mediaRecorderRef.current!.onstop = () => {
        const fullBlob = new Blob(chunksRef.current, { type: 'video/webm' });
        
        // In a real scenario, we might want to separate audio/video tracks or send the container.
        // For Gemini, sending the webm container usually works for multimodal.
        // We'll return the same blob for both for simplicity in this fallback implementation,
        // or effectively treat it as a video file with audio.
        
        resolve({ audioBlob: fullBlob, videoBlob: fullBlob });
        
        // Cleanup
        stream?.getTracks().forEach(track => track.stop());
        setStream(null);
        setIsRecording(false);
      };
      
      mediaRecorderRef.current!.stop();
    });
  }, [stream]);

  return { isRecording, stream, startRecording, stopRecording };
};
