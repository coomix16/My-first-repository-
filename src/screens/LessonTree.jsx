import StreakBadge from '../components/StreakBadge';

function LessonNode({ lesson, index, onSelect }) {
  const isFirst = index === 0;
  const positions = ['left-1/2 -translate-x-1/2', 'left-1/3 -translate-x-1/2', 'left-2/3 -translate-x-1/2', 'left-1/4 -translate-x-1/2', 'left-3/4 -translate-x-1/2'];
  const position = positions[index % positions.length];

  const statusColors = {
    unlocked: 'bg-gradient-to-br from-violet-500 to-violet-700 glow-purple',
    locked: 'bg-dark-600 border-2 border-dark-500',
  };

  const status = lesson.locked ? 'locked' : 'unlocked';

  return (
    <div className={`relative ${position} w-20 h-20`}>
      <button
        onClick={() => !lesson.locked && onSelect(lesson)}
        disabled={lesson.locked}
        className={`
          w-20 h-20 rounded-2xl flex flex-col items-center justify-center
          transition-all duration-200 active:scale-95
          ${statusColors[status]}
          ${!lesson.locked ? 'cursor-pointer hover:scale-105' : 'cursor-not-allowed opacity-60'}
        `}
      >
        {lesson.locked ? (
          <span className="text-2xl">🔒</span>
        ) : (
          <>
            <span className="text-2xl mb-0.5">🎯</span>
          </>
        )}
        <span className="text-white text-xs font-semibold mt-1">{lesson.title}</span>
      </button>

      {/* Lesson info bubble */}
      {!lesson.locked && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap">
          <div className="bg-violet-600 text-white text-xs rounded-lg px-2 py-1 font-medium">
            {lesson.subtitle}
          </div>
        </div>
      )}
    </div>
  );
}

export default function LessonTree({ lessons, completedCount, streak, onSelectLesson }) {
  const totalNodes = lessons.length;
  const progressCount = Math.min(completedCount + 1, totalNodes);

  return (
    <div className="flex flex-col min-h-screen bg-dark-900">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-12 pb-4">
        <div>
          <h1 className="text-white text-2xl font-bold">English</h1>
          <p className="text-gray-400 text-sm">Pimsleur Method</p>
        </div>
        <StreakBadge streak={streak} />
      </div>

      {/* Progress bar */}
      <div className="px-5 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-400 text-xs font-medium">Урок 1 — Основы</span>
          <span className="text-violet-400 text-xs font-medium">{progressCount}/{totalNodes} уроков</span>
        </div>
        <div className="w-full bg-dark-600 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-violet-500 to-violet-400 h-2 rounded-full transition-all duration-500"
            style={{ width: `${(progressCount / totalNodes) * 100}%` }}
          />
        </div>
      </div>

      {/* Lesson tree */}
      <div className="flex-1 relative px-5">
        <div className="relative" style={{ height: `${totalNodes * 130 + 60}px` }}>
          {/* Connecting path */}
          <svg
            className="absolute inset-0 w-full"
            style={{ height: `${totalNodes * 130 + 60}px` }}
            viewBox={`0 0 100 ${totalNodes * 130 + 60}`}
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="pathGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="20%" stopColor="#8b5cf6" />
                <stop offset="21%" stopColor="#374151" />
                <stop offset="100%" stopColor="#374151" />
              </linearGradient>
            </defs>
            <path
              d="M 50 60 C 30 120 70 160 40 220 C 20 270 80 310 60 380 C 40 430 70 480 50 530"
              stroke="url(#pathGrad)"
              strokeWidth="4"
              fill="none"
              strokeDasharray="8 4"
              strokeLinecap="round"
            />
          </svg>

          {/* Lesson nodes */}
          {lessons.map((lesson, index) => (
            <div
              key={lesson.id}
              className="absolute"
              style={{ top: `${index * 130 + 20}px`, left: 0, right: 0 }}
            >
              <div className="relative" style={{ height: '80px' }}>
                {/* Node positioned along the path */}
                <div
                  className={`absolute ${
                    index === 0 ? 'left-1/2 -translate-x-1/2' :
                    index === 1 ? 'left-[30%] -translate-x-1/2' :
                    index === 2 ? 'left-[65%] -translate-x-1/2' :
                    index === 3 ? 'left-[20%] -translate-x-1/2' :
                    'left-[55%] -translate-x-1/2'
                  }`}
                >
                  <button
                    onClick={() => !lesson.locked && onSelectLesson(lesson)}
                    disabled={lesson.locked}
                    className={`
                      w-20 h-20 rounded-2xl flex flex-col items-center justify-center relative
                      transition-all duration-200 active:scale-95
                      ${lesson.locked
                        ? 'bg-dark-700 border-2 border-dark-500 cursor-not-allowed'
                        : 'bg-gradient-to-br from-violet-500 to-violet-700 cursor-pointer hover:scale-105 glow-purple shadow-lg'
                      }
                    `}
                  >
                    {lesson.locked ? (
                      <>
                        <svg className="w-7 h-7 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v2H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-1V6a4 4 0 00-4-4zm0 2a2 2 0 00-2 2v2h4V6a2 2 0 00-2-2z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-500 text-[10px] font-bold mt-1">{lesson.title}</span>
                      </>
                    ) : (
                      <>
                        <span className="text-3xl">⭐</span>
                        <span className="text-white text-[10px] font-bold mt-0.5">{lesson.title}</span>
                      </>
                    )}
                  </button>

                  {/* Tooltip for unlocked */}
                  {!lesson.locked && (
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap z-10">
                      <div className="bg-violet-600 text-white text-xs rounded-xl px-3 py-1.5 font-semibold shadow-lg">
                        {lesson.subtitle}
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full">
                          <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-violet-600" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom nav hint */}
      <div className="px-5 pb-8 pt-4">
        <div className="bg-dark-700 rounded-2xl p-4 border border-dark-500">
          <p className="text-gray-400 text-sm text-center">
            Завершите уроки, чтобы открыть новый контент
          </p>
        </div>
      </div>
    </div>
  );
}
