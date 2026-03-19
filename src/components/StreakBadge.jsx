export default function StreakBadge({ streak }) {
  return (
    <div className="flex items-center gap-1.5 bg-dark-700 rounded-full px-3 py-1.5">
      <span className="text-orange-400 text-lg">🔥</span>
      <span className="text-white font-semibold text-sm">{streak}</span>
      <span className="text-gray-400 text-xs">day{streak !== 1 ? 's' : ''}</span>
    </div>
  );
}
