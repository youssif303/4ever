import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

/**
 * Wraps the browser's Web Speech API for speech-to-text input.
 *
 * Usage:
 *   const { isListening, supported, toggle } = useVoiceInput({
 *     onTranscript: (text) => setInput((prev) => prev + text),
 *   });
 *
 * - `supported`: false on native or browsers without SpeechRecognition
 * - `toggle`: starts or stops listening
 * - While listening, interim (partial) transcripts fire `onTranscript` so the
 *   user sees words appearing live; only the final result is delivered on stop.
 */
export function useVoiceInput({ onTranscript }: { onTranscript: (text: string) => void }) {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const onTranscriptRef = useRef(onTranscript);
  useEffect(() => { onTranscriptRef.current = onTranscript; }, [onTranscript]);

  const supported =
    Platform.OS === 'web' &&
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setIsListening(false);
  }, []);

  const start = useCallback(() => {
    if (!supported || isListening) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    let interim = '';

    recognition.onresult = (event: any) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          onTranscriptRef.current(transcript.trim());
          interim = '';
        } else {
          interim = transcript;
          onTranscriptRef.current(interim);
        }
      }
    };

    recognition.onend = () => {
      recognitionRef.current = null;
      setIsListening(false);
    };

    recognition.onerror = () => {
      recognitionRef.current = null;
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [supported, isListening]);

  const toggle = useCallback(() => {
    if (isListening) stop();
    else start();
  }, [isListening, start, stop]);

  // Clean up on unmount
  useEffect(() => () => { recognitionRef.current?.stop(); }, []);

  return { isListening, supported, start, stop, toggle };
}
