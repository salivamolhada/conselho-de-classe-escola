import React from 'react';

interface ChristmasLightsGarlandProps {
  paused?: boolean;
  bulbCount?: number;
  className?: string;
}

const BULB_PALETTE = [
  { fill: '#ef4444', glow: 'rgba(239, 68, 68, 0.72)' },   // Vermelho Natal
  { fill: '#facc15', glow: 'rgba(250, 204, 21, 0.75)' },  // Dourado
  { fill: '#22c55e', glow: 'rgba(34, 197, 94, 0.70)' },   // Verde Pinheiro
  { fill: '#38bdf8', glow: 'rgba(56, 189, 248, 0.70)' },  // Azul Gelo
];

export const ChristmasLightsGarland: React.FC<ChristmasLightsGarlandProps> = ({
  paused = false,
  bulbCount = 24,
  className = '',
}) => {
  const bulbs = Array.from({ length: bulbCount }, (_, index) => {
    const color = BULB_PALETTE[index % BULB_PALETTE.length];
    const isGroupA = index % 2 === 0;
    const delay = ((index % 5) * 0.35).toFixed(2);
    const leftPct = (index / (bulbCount - 1)) * 100;
    // Slight festoon sag between anchor points
    const seg = (index % 4) / 3;
    const sagOffset = Math.sin(seg * Math.PI) * 7;

    return {
      index,
      color,
      isGroupA,
      delay,
      leftPct,
      sagOffset,
    };
  });

  return (
    <div
      aria-hidden="true"
      className={`relative w-full h-8 overflow-visible pointer-events-none select-none no-print ${className}`}
    >
      {/* Fio verde escuro com curvatura suave */}
      <svg
        viewBox="0 0 1200 24"
        preserveAspectRatio="none"
        className="absolute top-0 left-0 w-full h-6 overflow-visible"
      >
        <path
          d="M0,2 Q100,14 200,3 T400,3 T600,3 T800,3 T1000,3 T1200,2"
          fill="none"
          stroke="#14532d"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>

      {/* Lâmpadas pisca-piscas */}
      <div className="relative w-full h-full">
        {bulbs.map((b) => (
          <div
            key={b.index}
            style={{
              left: `${b.leftPct}%`,
              top: `${Math.round(b.sagOffset)}px`,
              transform: 'translateX(-50%)',
            }}
            className="absolute flex flex-col items-center"
          >
            {/* Soquete */}
            <div className="w-2 h-2 bg-slate-800 border border-amber-500/40 rounded-t-[2px]" />
            {/* Bulbo iluminado */}
            <div
              style={{
                backgroundColor: b.color.fill,
                boxShadow: paused
                  ? `0 0 4px ${b.color.glow}`
                  : `0 0 10px 2px ${b.color.glow}, 0 0 20px 4px ${b.color.glow}`,
                animationDelay: `${b.delay}s`,
              }}
              className={`w-2.5 h-3.5 rounded-b-full rounded-t-[3px] transition-opacity ${
                paused ? 'opacity-80' : b.isGroupA ? 'animate-bulb-a' : 'animate-bulb-b'
              }`}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
