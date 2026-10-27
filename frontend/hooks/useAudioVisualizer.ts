'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

export function useAudioVisualizer(isActive: boolean = false, isAISpeaking: boolean = false) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [hasMicAccess, setHasMicAccess] = useState<boolean>(false);

  const initAudio = useCallback(async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return;
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContextClass();
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;
      sourceRef.current = source;
      setHasMicAccess(true);
    } catch {
      // User declined microphone or running in simulator; visualizer will use graceful simulation
      setHasMicAccess(false);
    }
  }, []);

  useEffect(() => {
    if (isActive && !hasMicAccess) {
      initAudio();
    }
  }, [isActive, hasMicAccess, initAudio]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const isLive = isActive || isAISpeaking;

      if (hasMicAccess && analyserRef.current && isActive) {
        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyserRef.current.getByteFrequencyData(dataArray);

        const barCount = 24;
        const barWidth = (width / barCount) - 3;
        
        for (let i = 0; i < barCount; i++) {
          const val = dataArray[i % bufferLength] || 10;
          const barHeight = Math.max(4, (val / 255) * height * 0.9);
          const x = i * (barWidth + 3);
          const y = (height - barHeight) / 2;

          const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
          gradient.addColorStop(0, '#818cf8');
          gradient.addColorStop(1, '#4f46e5');

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, barHeight, [4]);
          ctx.fill();
        }
      } else {
        // High-aesthetic animated waveform fallback when mic stream is not directly piped or AI speaking
        const barCount = 28;
        const barWidth = (width / barCount) - 4;
        phase += isLive ? 0.08 : 0.02;

        for (let i = 0; i < barCount; i++) {
          let multiplier = 0.15;
          if (isLive) {
            // Harmonic wave formula
            multiplier = Math.abs(Math.sin(phase + (i * 0.35)) * 0.6 + Math.cos(phase * 0.7 + (i * 0.2)) * 0.3);
          }
          const barHeight = Math.max(6, height * multiplier * (isAISpeaking ? 0.85 : 0.65));
          const x = i * (barWidth + 4);
          const y = (height - barHeight) / 2;

          const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
          if (isAISpeaking) {
            gradient.addColorStop(0, '#38bdf8');
            gradient.addColorStop(1, '#0284c7');
          } else if (isActive) {
            gradient.addColorStop(0, '#a855f7');
            gradient.addColorStop(1, '#6366f1');
          } else {
            gradient.addColorStop(0, '#334155');
            gradient.addColorStop(1, '#1e293b');
          }

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, barHeight, [4]);
          ctx.fill();
        }
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isActive, isAISpeaking, hasMicAccess]);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);

  return { canvasRef, hasMicAccess };
}
