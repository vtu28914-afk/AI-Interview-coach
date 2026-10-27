'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

export function useWebcam() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isMirrored, setIsMirrored] = useState<boolean>(true);

  const startWebcam = useCallback(async () => {
    try {
      setError(null);
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported by your browser');
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
        audio: false,
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setIsEnabled(true);
    } catch (err: any) {
      console.error('Failed to start webcam:', err);
      setError(err.message || 'Camera permission denied or camera unavailable');
      setIsEnabled(false);
    }
  }, []);

  const stopWebcam = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsEnabled(false);
  }, [stream]);

  const toggleWebcam = useCallback(() => {
    if (isEnabled) {
      stopWebcam();
    } else {
      startWebcam();
    }
  }, [isEnabled, startWebcam, stopWebcam]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  return {
    videoRef,
    isEnabled,
    stream,
    error,
    isMirrored,
    setIsMirrored,
    startWebcam,
    stopWebcam,
    toggleWebcam,
  };
}
