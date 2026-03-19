import { useState, useEffect } from 'react';

const STREAK_KEY = 'pimsleur_streak';
const LAST_PRACTICE_KEY = 'pimsleur_last_practice';

function getDaysDiff(date1, date2) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  d1.setHours(0, 0, 0, 0);
  d2.setHours(0, 0, 0, 0);
  return Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
}

export function useStreak() {
  const [streak, setStreak] = useState(0);
  const [lastPractice, setLastPractice] = useState(null);

  useEffect(() => {
    const savedStreak = parseInt(localStorage.getItem(STREAK_KEY) || '0', 10);
    const savedLastPractice = localStorage.getItem(LAST_PRACTICE_KEY);

    if (savedLastPractice) {
      const daysDiff = getDaysDiff(savedLastPractice, new Date());
      if (daysDiff <= 1) {
        setStreak(savedStreak);
      } else {
        // Streak broken if more than 1 day missed
        setStreak(0);
        localStorage.setItem(STREAK_KEY, '0');
      }
      setLastPractice(savedLastPractice);
    }
  }, []);

  const incrementStreak = () => {
    const today = new Date().toISOString().split('T')[0];
    const savedLastPractice = localStorage.getItem(LAST_PRACTICE_KEY);

    if (savedLastPractice === today) {
      // Already practiced today, no change
      return;
    }

    const savedStreak = parseInt(localStorage.getItem(STREAK_KEY) || '0', 10);
    let newStreak;

    if (savedLastPractice) {
      const daysDiff = getDaysDiff(savedLastPractice, today);
      newStreak = daysDiff <= 1 ? savedStreak + 1 : 1;
    } else {
      newStreak = 1;
    }

    setStreak(newStreak);
    setLastPractice(today);
    localStorage.setItem(STREAK_KEY, String(newStreak));
    localStorage.setItem(LAST_PRACTICE_KEY, today);
  };

  return { streak, incrementStreak };
}
