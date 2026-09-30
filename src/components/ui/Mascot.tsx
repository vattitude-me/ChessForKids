export type MascotMood = 'happy' | 'think' | 'wow' | 'sad' | 'cheer';

/** Coach Hoot, the Little Knights owl. Pure SVG so it scales crisply. */
export default function Mascot({ mood = 'happy', size = 96, className = '' }: { mood?: MascotMood; size?: number; className?: string }) {
  const eyeY = 52;
  return (
    <svg viewBox="0 0 120 130" width={size} height={size * (130 / 120)} className={className} role="img" aria-label="Coach Hoot the owl">
      {/* shadow */}
      <ellipse cx="60" cy="124" rx="30" ry="5" fill="rgba(34,37,74,0.12)" />
      {/* wings */}
      <g fill="#4032c9">
        {mood === 'cheer' ? (
          <>
            <path d="M22 70 C 4 52, 6 30, 14 26 C 20 40, 26 52, 34 60 Z" />
            <path d="M98 70 C 116 52, 114 30, 106 26 C 100 40, 94 52, 86 60 Z" />
          </>
        ) : (
          <>
            <path d="M24 60 C 8 72, 10 96, 26 104 C 28 90, 30 76, 34 66 Z" />
            <path d="M96 60 C 112 72, 110 96, 94 104 C 92 90, 90 76, 86 66 Z" />
          </>
        )}
      </g>
      {/* body */}
      <path d="M60 18 C 88 18, 100 40, 100 70 C 100 100, 84 118, 60 118 C 36 118, 20 100, 20 70 C 20 40, 32 18, 60 18 Z" fill="#5b4df5" />
      {/* ear tufts */}
      <path d="M30 30 L 26 10 L 44 22 Z" fill="#5b4df5" />
      <path d="M90 30 L 94 10 L 76 22 Z" fill="#5b4df5" />
      {/* belly */}
      <path d="M60 64 C 80 64, 86 82, 86 94 C 86 108, 74 114, 60 114 C 46 114, 34 108, 34 94 C 34 82, 40 64, 60 64 Z" fill="#ecebff" />
      <g stroke="#c9c4ff" strokeWidth="2.5" fill="none" strokeLinecap="round">
        <path d="M50 84 q 4 4 8 0" />
        <path d="M62 84 q 4 4 8 0" />
        <path d="M44 96 q 4 4 8 0" />
        <path d="M56 96 q 4 4 8 0" />
        <path d="M68 96 q 4 4 8 0" />
      </g>
      {/* face disc */}
      <circle cx="42" cy={eyeY} r="18" fill="#fff" />
      <circle cx="78" cy={eyeY} r="18" fill="#fff" />
      {mood === 'happy' || mood === 'cheer' ? (
        <g stroke="#22254a" strokeWidth="5" strokeLinecap="round" fill="none">
          <path d={`M33 ${eyeY + 3} q 9 -11 18 0`} />
          <path d={`M69 ${eyeY + 3} q 9 -11 18 0`} />
        </g>
      ) : mood === 'sad' ? (
        <g>
          <circle cx="44" cy={eyeY + 3} r="7" fill="#22254a" />
          <circle cx="76" cy={eyeY + 3} r="7" fill="#22254a" />
          <path d={`M28 ${eyeY - 14} l 14 6`} stroke="#4032c9" strokeWidth="4" strokeLinecap="round" />
          <path d={`M92 ${eyeY - 14} l -14 6`} stroke="#4032c9" strokeWidth="4" strokeLinecap="round" />
        </g>
      ) : (
        <g>
          <circle cx={mood === 'think' ? 46 : 42} cy={mood === 'think' ? eyeY - 3 : eyeY} r={mood === 'wow' ? 10 : 8} fill="#22254a" />
          <circle cx={mood === 'think' ? 82 : 78} cy={mood === 'think' ? eyeY - 3 : eyeY} r={mood === 'wow' ? 10 : 8} fill="#22254a" />
          <circle cx={mood === 'think' ? 49 : 45} cy={eyeY - 4} r="3" fill="#fff" />
          <circle cx={mood === 'think' ? 85 : 81} cy={eyeY - 4} r="3" fill="#fff" />
        </g>
      )}
      {/* beak */}
      <path d={`M54 ${eyeY + 12} L 66 ${eyeY + 12} L 60 ${eyeY + (mood === 'wow' ? 26 : 22)} Z`} fill="#ffc83d" stroke="#dea21a" strokeWidth="2" strokeLinejoin="round" />
      {/* cheeks */}
      <circle cx="30" cy={eyeY + 18} r="5" fill="#ff8fb1" opacity="0.7" />
      <circle cx="90" cy={eyeY + 18} r="5" fill="#ff8fb1" opacity="0.7" />
      {/* feet */}
      <g fill="#ffc83d" stroke="#dea21a" strokeWidth="2">
        <path d="M44 116 l -6 6 h 16 z" />
        <path d="M76 116 l -6 6 h 16 z" />
      </g>
      {mood === 'think' && (
        <g fill="#ffc83d">
          <circle cx="108" cy="16" r="5" />
          <circle cx="100" cy="28" r="3" />
        </g>
      )}
    </svg>
  );
}
