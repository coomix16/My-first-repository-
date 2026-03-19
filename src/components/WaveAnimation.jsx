export default function WaveAnimation({ color = 'purple' }) {
  const colors = {
    purple: 'bg-violet-500',
    green: 'bg-emerald-500',
    blue: 'bg-blue-500',
  };

  return (
    <div className="flex items-center justify-center gap-1 h-8">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className={`wave-bar w-1 rounded-full ${colors[color]}`}
          style={{
            height: '100%',
            animationDelay: `${(i - 1) * 0.1}s`,
          }}
        />
      ))}
    </div>
  );
}
