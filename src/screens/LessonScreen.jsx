import { useState, useEffect, useCallback } from 'react';
import { useSpeech, useTTS, checkPronunciation } from '../hooks/useSpeech';
import WaveAnimation from '../components/WaveAnimation';

// ─── Phase 1: LISTEN ──────────────────────────────────────────────────────────

function ListenPhase({ lesson, onComplete }) {
  const { isSpeaking, speak, cancel } = useTTS();
  const [currentLine, setCurrentLine] = useState(0);
  const [hasPlayed, setHasPlayed] = useState(false);

  const playCurrentLine = useCallback(() => {
    const line = lesson.dialogue[currentLine];
    speak(line.english, () => setHasPlayed(true));
  }, [currentLine, lesson.dialogue, speak]);

  useEffect(() => {
    const timer = setTimeout(() => {
      playCurrentLine();
    }, 600);
    return () => {
      clearTimeout(timer);
      cancel();
    };
  }, [currentLine]);

  const handleNext = () => {
    if (currentLine < lesson.dialogue.length - 1) {
      setCurrentLine(c => c + 1);
      setHasPlayed(false);
    } else {
      onComplete();
    }
  };

  const line = lesson.dialogue[currentLine];
  const isLast = currentLine === lesson.dialogue.length - 1;

  return (
    <div className="flex flex-col flex-1 fade-in">
      {/* Speaker label */}
      <div className="text-center mb-6">
        <div className={`
          inline-flex items-center gap-2 px-4 py-2 rounded-full
          ${line.speaker === 'A' ? 'bg-violet-900/40 border border-violet-700/50' : 'bg-emerald-900/40 border border-emerald-700/50'}
        `}>
          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold
            ${line.speaker === 'A' ? 'bg-violet-600' : 'bg-emerald-600'} text-white`}>
            {line.speaker}
          </div>
          <span className={`text-sm font-medium ${line.speaker === 'A' ? 'text-violet-300' : 'text-emerald-300'}`}>
            Говорящий {line.speaker}
          </span>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-2">
        <div className={`
          w-full rounded-3xl p-6 border mb-6
          ${line.speaker === 'A' ? 'bg-dark-700 border-violet-900/50' : 'bg-dark-700 border-emerald-900/50'}
        `}>
          <p className="text-white text-2xl font-medium text-center leading-relaxed">
            {line.english}
          </p>
          <p className="text-gray-500 text-sm text-center mt-3 font-mono">
            /{line.phonetic}/
          </p>
        </div>

        {/* Audio wave / play button */}
        <button
          onClick={playCurrentLine}
          disabled={isSpeaking}
          className={`
            w-16 h-16 rounded-full flex items-center justify-center mb-3
            transition-all duration-200 active:scale-95
            ${isSpeaking
              ? 'bg-blue-600 cursor-default'
              : 'bg-dark-600 border-2 border-dark-500 hover:border-blue-500 hover:bg-dark-500'
            }
          `}
        >
          {isSpeaking ? (
            <WaveAnimation color="blue" />
          ) : (
            <svg className="w-7 h-7 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
            </svg>
          )}
        </button>
        <p className="text-gray-500 text-xs">{isSpeaking ? 'Воспроизводится...' : 'Нажми для повтора'}</p>

        {/* Progress dots */}
        <div className="flex gap-2 mt-6">
          {lesson.dialogue.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i < currentLine ? 'bg-violet-500 w-4' :
                i === currentLine ? 'bg-white w-4' : 'bg-dark-500 w-1.5'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Next button */}
      <button
        onClick={handleNext}
        className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold text-base rounded-2xl py-4
                   active:scale-95 transition-all duration-150 shadow-lg"
      >
        {isLast ? 'Продолжить →' : 'Далее →'}
      </button>
    </div>
  );
}

// ─── Phase 2: REPEAT ──────────────────────────────────────────────────────────

function RepeatPhase({ lesson, onComplete }) {
  const { isSpeaking, speak, cancel } = useTTS();
  const { isListening, transcript, error, startListening, stopListening } = useSpeech();
  const [currentPhrase, setCurrentPhrase] = useState(0);
  const [result, setResult] = useState(null); // null | { score, pass }
  const [state, setState] = useState('idle'); // idle | playing | recording | done

  const phrase = lesson.phrases[currentPhrase];
  const isLast = currentPhrase === lesson.phrases.length - 1;

  useEffect(() => {
    setState('idle');
    setResult(null);
    const timer = setTimeout(() => {
      playPhrase();
    }, 500);
    return () => {
      clearTimeout(timer);
      cancel();
    };
  }, [currentPhrase]);

  const playPhrase = () => {
    setState('playing');
    speak(phrase.english, () => {
      setState('idle');
    });
  };

  const handleRecord = () => {
    if (isListening) {
      stopListening();
      return;
    }

    setState('recording');
    startListening(
      (text, alternatives) => {
        const allTexts = [text, ...alternatives];
        let best = { score: 0, pass: false };
        for (const t of allTexts) {
          const r = checkPronunciation(t, phrase.english);
          if (r.score > best.score) best = r;
        }
        setResult(best);
        setState('done');
      },
      () => {
        if (state === 'recording') setState('idle');
      }
    );
  };

  const handleNext = () => {
    if (isLast) {
      onComplete();
    } else {
      setCurrentPhrase(c => c + 1);
    }
  };

  const handleRetry = () => {
    setResult(null);
    setState('idle');
    playPhrase();
  };

  return (
    <div className="flex flex-col flex-1 fade-in">
      {/* Instruction */}
      <div className="text-center mb-6">
        <p className="text-gray-400 text-sm">Слушай, потом повторяй</p>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center">
        {/* Phrase card */}
        <div className="w-full bg-dark-700 rounded-3xl p-6 border border-dark-500 mb-6">
          <p className="text-white text-2xl font-medium text-center leading-relaxed">
            {phrase.english}
          </p>
          <p className="text-gray-500 text-sm text-center mt-2">{phrase.russian}</p>
        </div>

        {/* Play button */}
        <button
          onClick={playPhrase}
          disabled={isSpeaking || isListening}
          className={`
            w-14 h-14 rounded-full mb-5 flex items-center justify-center
            transition-all duration-200 active:scale-95
            ${isSpeaking ? 'bg-blue-600' : 'bg-dark-600 border-2 border-dark-500 hover:border-blue-500'}
          `}
        >
          {isSpeaking ? (
            <WaveAnimation color="blue" />
          ) : (
            <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217z" clipRule="evenodd" />
            </svg>
          )}
        </button>

        {/* Result feedback */}
        {result && (
          <div className={`w-full rounded-2xl p-4 mb-5 slide-up ${
            result.pass ? 'bg-emerald-900/30 border border-emerald-700/50' : 'bg-red-900/30 border border-red-700/50'
          }`}>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">{result.score === 100 ? '✅' : result.pass ? '👍' : '❌'}</span>
              <span className={`font-bold text-sm ${result.pass ? 'text-emerald-400' : 'text-red-400'}`}>
                {result.score === 100 ? 'Отлично!' : result.pass ? 'Хорошо! Можешь повторить для 100%' : 'Попробуй снова'}
              </span>
              <span className="ml-auto text-sm font-bold text-gray-300">{result.score}%</span>
            </div>
            {transcript && (
              <p className="text-gray-400 text-xs mt-1">
                Вы сказали: "<span className="text-gray-200">{transcript}</span>"
              </p>
            )}
          </div>
        )}

        {error && (
          <div className="w-full bg-red-900/20 border border-red-700/30 rounded-2xl p-3 mb-4">
            <p className="text-red-400 text-xs text-center">{error}</p>
          </div>
        )}

        {/* Record button */}
        <div className="relative flex items-center justify-center">
          {isListening && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-violet-500/20 pulse-ring" />
            </div>
          )}
          <button
            onClick={handleRecord}
            disabled={isSpeaking}
            className={`
              w-20 h-20 rounded-full flex items-center justify-center z-10 relative
              transition-all duration-200 active:scale-95
              ${isListening
                ? 'bg-red-600 shadow-lg'
                : 'bg-gradient-to-br from-violet-600 to-violet-800 shadow-lg glow-purple'
              }
            `}
          >
            {isListening ? (
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        </div>
        <p className="text-gray-500 text-xs mt-3">
          {isListening ? 'Запись... нажми для остановки' : 'Нажми для записи'}
        </p>

        {/* Progress dots */}
        <div className="flex gap-2 mt-6">
          {lesson.phrases.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i < currentPhrase ? 'bg-violet-500 w-4' :
                i === currentPhrase ? 'bg-white w-4' : 'bg-dark-500 w-1.5'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Next button */}
      {result && result.pass && result.score < 100 ? (
        <div className="flex gap-3">
          <button
            onClick={handleRetry}
            className="flex-1 bg-dark-600 border border-dark-500 text-gray-400 font-medium text-sm rounded-2xl py-4 active:scale-95 transition-all duration-150"
          >
            Повторить
          </button>
          <button
            onClick={handleNext}
            className="flex-1 bg-gradient-to-r from-violet-600 to-violet-500 text-white font-bold text-base rounded-2xl py-4 active:scale-95 transition-all duration-150 shadow-lg"
          >
            Продолжить
          </button>
        </div>
      ) : (
        <button
          onClick={handleNext}
          disabled={!error && (!result || !result.pass)}
          className={`
            w-full font-bold text-base rounded-2xl py-4
            transition-all duration-150 active:scale-95
            ${(result?.pass || error)
              ? 'bg-gradient-to-r from-violet-600 to-violet-500 text-white shadow-lg'
              : 'bg-dark-600 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          {isLast ? 'Продолжить →' : 'Далее →'}
        </button>
      )}
    </div>
  );
}

// ─── Phase 3: SAY ─────────────────────────────────────────────────────────────

function SayPhase({ lesson, onComplete }) {
  const { isListening, transcript, error, startListening, stopListening } = useSpeech();
  const [currentPhrase, setCurrentPhrase] = useState(0);
  const [result, setResult] = useState(null);
  const [revealed, setRevealed] = useState(false);

  const phrase = lesson.phrases[currentPhrase];
  const isLast = currentPhrase === lesson.phrases.length - 1;

  useEffect(() => {
    setResult(null);
    setRevealed(false);
  }, [currentPhrase]);

  const handleRecord = () => {
    if (isListening) {
      stopListening();
      return;
    }

    startListening(
      (text, alternatives) => {
        const allTexts = [text, ...alternatives];
        let best = { score: 0, pass: false };
        for (const t of allTexts) {
          const r = checkPronunciation(t, phrase.english);
          if (r.score > best.score) best = r;
        }
        setResult(best);
        setRevealed(true);
      },
      () => {}
    );
  };

  const handleNext = () => {
    if (isLast) {
      onComplete();
    } else {
      setCurrentPhrase(c => c + 1);
    }
  };

  const handleRetry = () => {
    setResult(null);
  };

  return (
    <div className="flex flex-col flex-1 fade-in">
      {/* Instruction */}
      <div className="text-center mb-6">
        <p className="text-gray-400 text-sm">Произнеси английскую фразу к русскому тексту</p>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center">
        {/* Russian prompt */}
        <div className="w-full bg-dark-700 rounded-3xl p-6 border border-orange-900/40 mb-4">
          <p className="text-orange-300 text-xs uppercase tracking-wider font-semibold mb-2 text-center">Переведи на английский</p>
          <p className="text-white text-3xl font-bold text-center leading-relaxed">
            {phrase.russian}
          </p>
        </div>

        {/* English answer (revealed after attempt) */}
        <div className={`w-full rounded-3xl p-5 border mb-5 transition-all duration-300 ${
          revealed
            ? 'bg-dark-700 border-dark-500'
            : 'bg-dark-800 border-dark-600 opacity-50'
        }`}>
          <p className="text-gray-500 text-xs text-center mb-1">Английский</p>
          <p className={`text-xl font-medium text-center ${revealed ? 'text-white' : 'text-transparent select-none'}`}
             style={!revealed ? { textShadow: '0 0 8px rgba(255,255,255,0.3)' } : {}}>
            {phrase.english}
          </p>
        </div>

        {/* Result */}
        {result && (
          <div className={`w-full rounded-2xl p-4 mb-5 slide-up ${
            result.pass ? 'bg-emerald-900/30 border border-emerald-700/50' : 'bg-orange-900/30 border border-orange-700/50'
          }`}>
            <div className="flex items-center gap-2">
              <span className="text-xl">{result.score === 100 ? '🎉' : result.pass ? '👍' : '💪'}</span>
              <span className={`font-bold text-sm ${result.pass ? 'text-emerald-400' : 'text-orange-400'}`}>
                {result.score === 100 ? 'Отлично!' : result.pass ? 'Хорошо! Можешь повторить для 100%' : 'Попробуй снова'}
              </span>
              <span className="ml-auto text-sm font-bold text-gray-300">{result.score}%</span>
            </div>
            {transcript && (
              <p className="text-gray-400 text-xs mt-1">
                Вы сказали: "<span className="text-gray-200">{transcript}</span>"
              </p>
            )}
          </div>
        )}

        {error && (
          <div className="w-full bg-red-900/20 border border-red-700/30 rounded-2xl p-3 mb-4">
            <p className="text-red-400 text-xs text-center">{error}</p>
          </div>
        )}

        {/* Record button */}
        <div className="relative flex items-center justify-center">
          {isListening && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-emerald-500/20 pulse-ring" />
            </div>
          )}
          <button
            onClick={handleRecord}
            className={`
              w-20 h-20 rounded-full flex items-center justify-center z-10 relative
              transition-all duration-200 active:scale-95
              ${isListening
                ? 'bg-red-600 shadow-lg'
                : 'bg-gradient-to-br from-emerald-600 to-emerald-800 shadow-lg glow-green'
              }
            `}
          >
            {isListening ? (
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        </div>
        <p className="text-gray-500 text-xs mt-3">
          {isListening ? 'Запись... нажми для остановки' : 'Нажми для ответа'}
        </p>

        {/* Progress dots */}
        <div className="flex gap-2 mt-6">
          {lesson.phrases.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i < currentPhrase ? 'bg-emerald-500 w-4' :
                i === currentPhrase ? 'bg-white w-4' : 'bg-dark-500 w-1.5'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Bottom action buttons */}
      {result && result.pass && result.score < 100 ? (
        <div className="flex gap-3">
          <button
            onClick={handleRetry}
            className="flex-1 bg-dark-600 border border-dark-500 text-gray-400 font-medium text-sm rounded-2xl py-4 active:scale-95 transition-all duration-150"
          >
            Повторить
          </button>
          <button
            onClick={handleNext}
            className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-bold text-base rounded-2xl py-4 active:scale-95 transition-all duration-150 shadow-lg"
          >
            Продолжить
          </button>
        </div>
      ) : result && !result.pass ? (
        <button
          onClick={handleRetry}
          className="w-full bg-dark-600 border border-dark-500 text-gray-400 font-medium text-sm rounded-2xl py-4 active:scale-95 transition-all duration-150"
        >
          Повторить
        </button>
      ) : (
        <div className="flex gap-3">
          {!revealed && (
            <button
              onClick={() => setRevealed(true)}
              className="flex-1 bg-dark-600 border border-dark-500 text-gray-400 font-medium text-sm rounded-2xl py-4
                         active:scale-95 transition-all duration-150"
            >
              Показать ответ
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={!revealed}
            className={`
              font-bold text-base rounded-2xl py-4 transition-all duration-150 active:scale-95
              ${revealed ? 'flex-1 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg' : 'hidden'}
            `}
          >
            {isLast ? 'Завершить урок 🎉' : 'Далее →'}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Main Lesson Screen ────────────────────────────────────────────────────────

const PHASES = [
  { key: 'listen', label: 'СЛУШАЙ', icon: '👂', color: 'text-blue-400', bgActive: 'bg-blue-600' },
  { key: 'repeat', label: 'ПОВТОРЯЙ', icon: '🎤', color: 'text-violet-400', bgActive: 'bg-violet-600' },
  { key: 'say', label: 'ГОВОРИ', icon: '💬', color: 'text-emerald-400', bgActive: 'bg-emerald-600' },
];

export default function LessonScreen({ lesson, onComplete, onBack }) {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const currentPhase = PHASES[phaseIndex];

  const advancePhase = () => {
    if (phaseIndex < PHASES.length - 1) {
      setPhaseIndex(p => p + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-dark-900">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-12 pb-4">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-full bg-dark-700 flex items-center justify-center"
        >
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1">
          <p className="text-gray-400 text-xs">{lesson.title}</p>
          <h2 className="text-white text-base font-semibold">{lesson.subtitle}</h2>
        </div>
      </div>

      {/* Phase indicators */}
      <div className="px-5 mb-6">
        <div className="flex gap-2 bg-dark-800 rounded-2xl p-1.5">
          {PHASES.map((phase, i) => (
            <div
              key={phase.key}
              className={`
                flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2.5
                transition-all duration-300
                ${i === phaseIndex
                  ? `${phase.bgActive} shadow-sm`
                  : i < phaseIndex ? 'bg-dark-700' : 'bg-transparent'
                }
              `}
            >
              <span className="text-sm">{phase.icon}</span>
              <span className={`text-xs font-bold ${
                i === phaseIndex ? 'text-white' :
                i < phaseIndex ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {phase.label}
              </span>
              {i < phaseIndex && (
                <svg className="w-3 h-3 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Phase content */}
      <div className="flex-1 flex flex-col px-5 pb-6 safe-area-inset">
        {phaseIndex === 0 && <ListenPhase lesson={lesson} onComplete={advancePhase} />}
        {phaseIndex === 1 && <RepeatPhase lesson={lesson} onComplete={advancePhase} />}
        {phaseIndex === 2 && <SayPhase lesson={lesson} onComplete={onComplete} />}
      </div>
    </div>
  );
}
