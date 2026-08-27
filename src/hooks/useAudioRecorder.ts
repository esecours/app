import { useState, useRef, useCallback, useEffect } from 'react';
import { getMicErrorMessage } from '../lib/permissions';

export function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [mimeType, setMimeType] = useState<string>('audio/webm');
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [permissionState, setPermissionState] = useState<PermissionState | 'unknown'>('unknown');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (navigator.permissions && (navigator.permissions as any).query) {
      navigator.permissions.query({ name: 'microphone' as any }).then((result) => {
        setPermissionState(result.state);
        result.onchange = () => {
          setPermissionState(result.state);
        };
      }).catch(err => {
        // Silently fail for permission query if not supported
        console.debug("Microphone permission query not supported:", err);
      });
    }
  }, []);

  const startRecording = useCallback(async () => {
    setError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("L'API MediaDevices n'est pas supportée. Vérifiez que vous utilisez une connexion sécurisée (HTTPS) ou localhost.");
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setPermissionState('granted');
      
      const mimeTypes = [
        'audio/webm;codecs=opus',
        'audio/mp4;codecs=aac',
        'audio/mp4',
        'audio/ogg;codecs=opus',
        'audio/webm',
        'audio/wav'
      ];
      
      let mimeType = 'audio/webm'; // Default fallback
      for (const type of mimeTypes) {
        if (MediaRecorder.isTypeSupported(type)) {
          mimeType = type;
          break;
        }
      }
      setMimeType(mimeType);
          
      const mediaRecorder = new MediaRecorder(stream, { 
        mimeType,
        audioBitsPerSecond: 24000 // Voice quality, small file size
      });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(1000); // Send data chunks every second
      setIsRecording(true);
      setDuration(0);
      
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = window.setInterval(() => {
        setDuration(prev => {
          if (prev >= 59) { 
            // Inline stop logic to avoid stale closure issues
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
              mediaRecorderRef.current.stop();
              setIsRecording(false);
              if (timerRef.current) clearInterval(timerRef.current);
            }
            return 60;
          }
          return prev + 1;
        });
      }, 1000);

    } catch (err: any) {
      console.warn('Mic access error details:', err.name, err.message);
      const msg = getMicErrorMessage(err);
      setError(msg);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError' || err.message?.includes('denied') || err.message?.includes('Permission')) {
        setPermissionState('denied');
      }
      // We don't alert here anymore to avoid redundant popups, 
      // the UI components using the hook should handle displaying the error.
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, []);

  const clearRecording = useCallback(() => {
    setAudioBlob(null);
    setDuration(0);
    setError(null);
  }, []);

  return {
    isRecording,
    audioBlob,
    mimeType,
    duration,
    error,
    permissionState,
    startRecording,
    stopRecording,
    clearRecording
  };
}
