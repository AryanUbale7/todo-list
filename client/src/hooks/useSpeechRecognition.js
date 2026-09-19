import { useState, useCallback } from 'react';

/**
 * Custom hook for hands-free voice speech-to-text task creation
 * @param {(transcript: string) => void} onResult
 * @returns {{ isListening: boolean, isSupported: boolean, startListening: () => void, stopListening: () => void }}
 */
export function useSpeechRecognition(onResult) {
  const [isListening, setIsListening] = useState(false);
  const isSupported = typeof window !== 'undefined' && Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);

  const startListening = useCallback(() => {
    if (!isSupported) {
      alert('Speech Recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript;
      if (transcript && onResult) {
        onResult(transcript);
      }
    };

    recognition.start();
  }, [isSupported, onResult]);

  const stopListening = useCallback(() => {
    setIsListening(false);
  }, []);

  return { isListening, isSupported, startListening, stopListening };
}
