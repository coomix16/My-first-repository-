export default function LessonPreview({ lesson, onStart, onBack }) {
  return (
    <div className="flex flex-col min-h-screen bg-dark-900 fade-in">
      {/* Header */}
      <div className="relative">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-violet-900/40 to-dark-900" />

        <div className="relative px-5 pt-12 pb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm font-medium">Назад</span>
          </button>

          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center shadow-lg glow-purple shrink-0">
              <span className="text-3xl">⭐</span>
            </div>
            <div>
              <p className="text-violet-400 text-sm font-semibold uppercase tracking-wider mb-1">{lesson.title}</p>
              <h1 className="text-white text-2xl font-bold leading-tight">{lesson.subtitle}</h1>
              <p className="text-gray-400 text-sm mt-1">{lesson.duration}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-5 pb-4 overflow-y-auto space-y-5">
        {/* Skills covered */}
        <section>
          <h2 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">Чему научишься</h2>
          <div className="flex flex-wrap gap-2">
            {lesson.skills.map((skill, i) => (
              <div
                key={i}
                className="bg-violet-900/40 border border-violet-700/50 text-violet-300 text-sm rounded-full px-3 py-1.5 font-medium"
              >
                ✓ {skill}
              </div>
            ))}
          </div>
        </section>

        {/* Dialogue preview */}
        <section>
          <h2 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">Диалог</h2>
          <div className="space-y-2">
            {lesson.dialogue.map((line) => (
              <div
                key={line.id}
                className={`flex gap-3 ${line.speaker === 'B' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`
                  w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0
                  ${line.speaker === 'A' ? 'bg-violet-600 text-white' : 'bg-emerald-600 text-white'}
                `}>
                  {line.speaker}
                </div>
                <div className={`
                  flex-1 rounded-2xl px-4 py-3 max-w-[85%]
                  ${line.speaker === 'A' ? 'bg-dark-700 rounded-tl-sm' : 'bg-dark-600 rounded-tr-sm'}
                `}>
                  <p className="text-white text-sm font-medium leading-relaxed">{line.english}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Practice phrases */}
        <section>
          <h2 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">Фразы для практики</h2>
          <div className="space-y-2">
            {lesson.phrases.map((phrase) => (
              <div
                key={phrase.id}
                className="flex items-center justify-between bg-dark-700 rounded-xl px-4 py-3 border border-dark-500"
              >
                <div>
                  <p className="text-white text-sm font-medium">{phrase.english}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{phrase.russian}</p>
                </div>
                <div className="w-6 h-6 rounded-full bg-violet-900/50 flex items-center justify-center">
                  <svg className="w-3 h-3 text-violet-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="bg-dark-700 rounded-2xl p-4 border border-dark-500">
          <h2 className="text-white text-sm font-semibold mb-3">Как проходит урок</h2>
          <div className="space-y-2.5">
            {[
              { icon: '👂', color: 'text-blue-400', label: 'СЛУШАЙ', desc: 'слушай весь диалог' },
              { icon: '🎤', color: 'text-violet-400', label: 'ПОВТОРЯЙ', desc: 'записывай себя' },
              { icon: '💬', color: 'text-emerald-400', label: 'ГОВОРИ', desc: 'переводи и произноси' },
            ].map((phase) => (
              <div key={phase.label} className="flex items-center gap-3">
                <span className="text-xl">{phase.icon}</span>
                <div>
                  <span className={`text-xs font-bold ${phase.color}`}>{phase.label} </span>
                  <span className="text-gray-400 text-xs">— {phase.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Start button */}
      <div className="px-5 py-5 safe-area-inset">
        <button
          onClick={lesson.locked ? undefined : onStart}
          disabled={lesson.locked}
          className={`w-full font-bold text-lg rounded-2xl py-4 transition-all duration-150 ${
            lesson.locked
              ? 'bg-dark-700 border border-dark-500 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-violet-600 to-violet-500 text-white active:scale-95 shadow-lg glow-purple'
          }`}
        >
          {lesson.locked ? 'Сначала пройди предыдущий урок' : 'Начать урок'}
        </button>
      </div>
    </div>
  );
}
