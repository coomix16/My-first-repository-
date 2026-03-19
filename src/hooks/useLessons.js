import { useState, useCallback, useMemo } from 'react';
import { LESSONS } from '../data/lessons';

const COMPLETED_KEY = 'pimsleur_completed';

export function useLessons() {
  const [completedIds, setCompletedIds] = useState(() => {
    try {
      const raw = localStorage.getItem(COMPLETED_KEY);
      const parsed = JSON.parse(raw || '[]');
      console.log('[useLessons] init completedIds from localStorage:', parsed);
      return parsed;
    } catch {
      return [];
    }
  });

  const lessons = useMemo(() => {
    console.log('[useLessons] recomputing lessons, completedIds:', completedIds);
    return LESSONS.map((lesson, i) => {
      const locked = i === 0 ? false : !completedIds.includes(LESSONS[i - 1].id);
      console.log(`[useLessons] lesson id=${lesson.id} (index ${i}): locked=${locked}`);
      return { ...lesson, locked };
    });
  }, [completedIds]);

  const completeLesson = useCallback((lessonId) => {
    console.log('[useLessons] completeLesson called, lessonId:', lessonId, 'type:', typeof lessonId);
    setCompletedIds(prev => {
      console.log('[useLessons] prev completedIds:', prev);
      if (prev.includes(lessonId)) {
        console.log('[useLessons] already completed, skipping');
        return prev;
      }
      const next = [...prev, lessonId];
      localStorage.setItem(COMPLETED_KEY, JSON.stringify(next));
      console.log('[useLessons] saved to localStorage:', JSON.stringify(next));
      return next;
    });
  }, []);

  return { lessons, completeLesson, completedCount: completedIds.length };
}
