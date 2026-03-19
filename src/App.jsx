import { useState } from 'react';
import { useStreak } from './hooks/useStreak';
import LessonTree from './screens/LessonTree';
import LessonPreview from './screens/LessonPreview';
import LessonScreen from './screens/LessonScreen';
import CompletionScreen from './screens/CompletionScreen';

const SCREEN = {
  TREE: 'tree',
  PREVIEW: 'preview',
  LESSON: 'lesson',
  COMPLETE: 'complete',
};

export default function App() {
  const { streak, incrementStreak } = useStreak();
  const [screen, setScreen] = useState(SCREEN.TREE);
  const [selectedLesson, setSelectedLesson] = useState(null);

  const handleSelectLesson = (lesson) => {
    setSelectedLesson(lesson);
    setScreen(SCREEN.PREVIEW);
  };

  const handleStartLesson = () => {
    setScreen(SCREEN.LESSON);
  };

  const handleLessonComplete = () => {
    incrementStreak();
    setScreen(SCREEN.COMPLETE);
  };

  const handleHome = () => {
    setSelectedLesson(null);
    setScreen(SCREEN.TREE);
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-dark-900 relative">
      {screen === SCREEN.TREE && (
        <LessonTree
          streak={streak}
          onSelectLesson={handleSelectLesson}
        />
      )}

      {screen === SCREEN.PREVIEW && selectedLesson && (
        <LessonPreview
          lesson={selectedLesson}
          onStart={handleStartLesson}
          onBack={handleHome}
        />
      )}

      {screen === SCREEN.LESSON && selectedLesson && (
        <LessonScreen
          lesson={selectedLesson}
          onComplete={handleLessonComplete}
          onBack={() => setScreen(SCREEN.PREVIEW)}
        />
      )}

      {screen === SCREEN.COMPLETE && selectedLesson && (
        <CompletionScreen
          lesson={selectedLesson}
          streak={streak}
          onHome={handleHome}
        />
      )}
    </div>
  );
}
