import { useState, useEffect } from 'react';

export function useNotifications() {
  const [permission, setPermission] = useState('default');

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (!('Notification' in window)) return false;

    const result = await Notification.requestPermission();
    setPermission(result);
    if (result === 'granted') {
      scheduleDailyReminder();
      return true;
    }
    return false;
  };

  const scheduleDailyReminder = () => {
    // Store the reminder preference
    localStorage.setItem('pimsleur_notifications', 'true');

    // Show a confirmation notification
    if (Notification.permission === 'granted') {
      new Notification('Pimsleur English', {
        body: "Great! You'll get a daily reminder to practice.",
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
      });
    }
  };

  const sendReminder = () => {
    if (Notification.permission === 'granted') {
      new Notification('Time to practice English!', {
        body: 'Keep your streak alive. Practice for 15 minutes today.',
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
        tag: 'daily-reminder',
      });
    }
  };

  return { permission, requestPermission, sendReminder };
}
