import { useEffect, useState } from 'react';
import { useNotifications } from '../hooks/useNotifications';

export default function CompletionScreen({ lesson, streak, onHome }) {
  const { permission, requestPermission } = useNotifications();
  const [askedNotif, setAskedNotif] = useState(false);
  const [notifGranted, setNotifGranted] = useState(false);
  const [stars] = useState(() =>
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 60,
      size: Math.random() * 12 + 8,
      delay: Math.random() * 0.8,
    }))
  );

  const handleEnableNotifications = async () => {
    const granted = await requestPermission();
    setNotifGranted(granted);
    setAskedNotif(true);
  };

  return (
    <div className="flex flex-col min-h-screen bg-dark-900 relative overflow-hidden fade-in">
      {/* Floating stars */}
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute text-yellow-400 pointer-events-none"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            fontSize: `${star.size}px`,
            animation: `fadeIn 0.4s ease-out ${star.delay}s both`,
            opacity: 0.6,
          }}
        >
          ★
        </div>
      ))}

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 text-center relative z-10">
        {/* Trophy */}
        <div className="w-28 h-28 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mb-6 shadow-2xl"
             style={{ boxShadow: '0 0 40px rgba(251, 191, 36, 0.4)' }}>
          <span className="text-5xl">🏆</span>
        </div>

        <h1 className="text-white text-3xl font-bold mb-2">Lesson Complete!</h1>
        <p className="text-gray-400 text-base mb-8">{lesson.subtitle}</p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 w-full mb-8">
          {[
            { icon: '🔥', label: 'Streak', value: `${streak} day${streak !== 1 ? 's' : ''}` },
            { icon: '⭐', label: 'XP Earned', value: '+15 XP' },
            { icon: '✅', label: 'Phrases', value: `${lesson.phrases.length}/${lesson.phrases.length}` },
          ].map((stat) => (
            <div key={stat.label} className="bg-dark-700 rounded-2xl p-3 border border-dark-500">
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="text-white font-bold text-sm">{stat.value}</div>
              <div className="text-gray-500 text-xs">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Notification prompt */}
        {permission !== 'granted' && !askedNotif && (
          <div className="w-full bg-gradient-to-r from-violet-900/50 to-violet-800/30 border border-violet-700/50 rounded-2xl p-4 mb-4">
            <p className="text-white text-sm font-semibold mb-1">Never miss a day 🔔</p>
            <p className="text-gray-400 text-xs mb-3">Get a daily reminder to keep your streak alive</p>
            <button
              onClick={handleEnableNotifications}
              className="w-full bg-violet-600 text-white text-sm font-semibold rounded-xl py-2.5
                         active:scale-95 transition-all duration-150"
            >
              Enable Daily Reminders
            </button>
          </div>
        )}

        {notifGranted && (
          <div className="w-full bg-emerald-900/30 border border-emerald-700/50 rounded-2xl p-3 mb-4 slide-up">
            <p className="text-emerald-400 text-sm font-medium text-center">
              ✅ You'll get daily reminders!
            </p>
          </div>
        )}
      </div>

      {/* Home button */}
      <div className="px-5 pb-8 safe-area-inset">
        <button
          onClick={onHome}
          className="w-full bg-gradient-to-r from-violet-600 to-violet-500 text-white font-bold text-lg rounded-2xl py-4
                     active:scale-95 transition-all duration-150 shadow-lg glow-purple"
        >
          Back to Lessons
        </button>
      </div>
    </div>
  );
}
