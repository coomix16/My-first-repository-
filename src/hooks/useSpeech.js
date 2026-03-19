import { useState, useRef, useCallback } from 'react';

export function useSpeech() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);

  const startListening = useCallback((onResult, onEnd) => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Speech recognition not supported in this browser.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 3;

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript('');
      setError(null);
    };

    recognition.onresult = (event) => {
      const results = event.results;
      const lastResult = results[results.length - 1];
      const text = lastResult[0].transcript;
      setTranscript(text);
      if (lastResult.isFinal && onResult) {
        onResult(text, Array.from(lastResult).map(r => r.transcript));
      }
    };

    recognition.onerror = (event) => {
      if (event.error !== 'aborted') {
        setError(event.error === 'no-speech' ? 'No speech detected. Try again.' : `Error: ${event.error}`);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      if (onEnd) onEnd();
    };

    try {
      recognition.start();
    } catch (e) {
      setError('Could not start microphone.');
      setIsListening(false);
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  return { isListening, transcript, error, startListening, stopListening };
}

export function useTTS() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef(null);

  const speak = useCallback((text, onEnd) => {
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.85;
    utterance.pitch = 1;
    utterance.volume = 1;

    // Try to find a good English voice
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(v =>
      v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.localService)
    ) || voices.find(v => v.lang.startsWith('en'));

    if (englishVoice) utterance.voice = englishVoice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      if (onEnd) onEnd();
    };
    utterance.onerror = () => setIsSpeaking(false);

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  }, []);

  const cancel = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  return { isSpeaking, speak, cancel };
}

export function checkPronunciation(spoken, target) {
  const normalize = (s) => s.toLowerCase().replace(/[^a-z\s]/g, '').trim();
  const spokenNorm = normalize(spoken);
  const targetNorm = normalize(target);

  if (spokenNorm === targetNorm) return { score: 100, pass: true };

  // Check word overlap
  const spokenWords = spokenNorm.split(/\s+/);
  const targetWords = targetNorm.split(/\s+/);
  const matches = targetWords.filter(w => spokenWords.includes(w));
  const score = Math.round((matches.length / targetWords.length) * 100);

  return { score, pass: score >= 60 };
}
