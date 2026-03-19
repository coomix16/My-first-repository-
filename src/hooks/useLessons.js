import { useState, useCallback } from 'react';
import { LESSONS } from '../data/lessons';

const COMPLETED_KEY = 'pimsleur_completed';

export function useLessons() {
  const [completedIds, setCompletedIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(COMPLETED_KEY) || '[]');
    } catch {
      return [];
    }
  });

  const lessons = LESSONS.map((lesson, i) => ({
    ...lesson,
    locked: i === 0 ? false : !completedIds.includes(LESSONS[i - 1].id),
  }));

  const completeLesson = useCallback((lessonId) => {
    setCompletedIds(prev => {
      if (prev.includes(lessonId)) return prev;
      const next = [...prev, lessonId];
      localStorage.setItem(COMPLETED_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return { lessons, completeLesson, completedCount: completedIds.length };
}
