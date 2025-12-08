
import React, { useEffect, useRef } from 'react';

export const AudioVisualizer: React.FC<{ stream: MediaStream | null }> = ({ stream }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    if (!stream || !canvasRef.current) return;

    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const analyser = audioCtx.createAnalyser();
    const source = audioCtx.createMediaStreamSource(stream);
    source.connect(analyser);
    
    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    
    let animationId: number;

    const draw = () => {
      animationId = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      ctx.fillStyle = '#0B0F1E'; // Match nebula-900
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] / 2;
        
        // Gradient color based on height
        const r = barHeight + 25 * (i/bufferLength);
        const g = 250 * (i/bufferLength);
        const b = 50;

        ctx.fillStyle = `rgba(6, 182, 212, ${barHeight / 100})`; // tech-cyan
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

        x += barWidth + 1;
      }
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      audioCtx.close();
    };
  }, [stream]);

  return <canvas ref={canvasRef} width={300} height={60} className="w-full h-full rounded-xl opacity-80" />;
};
