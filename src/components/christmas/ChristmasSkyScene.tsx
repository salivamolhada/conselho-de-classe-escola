import React, { useEffect, useRef, useState } from 'react';

interface ChristmasSkySceneProps {
  enabled?: boolean;
}

interface Snowflake {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  alpha: number;
}

interface FallingGift {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vRot: number;
  color: string;
  ribbon: string;
  size: number;
  landed: boolean;
  landedTimer: number;
}

const GIFT_THEMES = [
  { color: '#dc2626', ribbon: '#facc15' },
  { color: '#16a34a', ribbon: '#facc15' },
  { color: '#f59e0b', ribbon: '#b91c1c' },
  { color: '#0284c7', ribbon: '#f8fafc' },
];

const STARS = [
  { x: '6%', y: '10%', size: 2.5, delay: '0s' },
  { x: '13%', y: '22%', size: 2, delay: '0.6s' },
  { x: '22%', y: '8%', size: 3, delay: '1.1s' },
  { x: '31%', y: '18%', size: 2, delay: '0.3s' },
  { x: '42%', y: '11%', size: 2.5, delay: '1.7s' },
  { x: '53%', y: '15%', size: 2, delay: '0.9s' },
  { x: '64%', y: '7%', size: 3, delay: '1.4s' },
  { x: '73%', y: '20%', size: 2, delay: '0.2s' },
  { x: '84%', y: '13%', size: 2.5, delay: '1.8s' },
  { x: '93%', y: '24%', size: 2, delay: '0.5s' },
  { x: '17%', y: '34%', size: 1.8, delay: '1.2s' },
  { x: '48%', y: '28%', size: 2, delay: '2.1s' },
  { x: '78%', y: '31%', size: 1.8, delay: '1.5s' },
];

export const ChristmasSkyScene: React.FC<ChristmasSkySceneProps> = ({ enabled = true }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const santaRef = useRef<HTMLDivElement | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const isAnimating = enabled && !prefersReducedMotion;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const flakes: Snowflake[] = Array.from({ length: 65 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: 1.1 + Math.random() * 2.3,
      vx: -0.3 + Math.random() * 0.6,
      vy: 0.45 + Math.random() * 0.95,
      alpha: 0.35 + Math.random() * 0.55,
    }));

    const gifts: FallingGift[] = [];
    let giftIdCounter = 1;

    // Santa flight state
    let santaX = -320;
    const santaSpeed = 1.65; // px per frame (~60fps)
    let frameCount = 0;
    let rafId = 0;

    const drawGift = (g: FallingGift) => {
      ctx.save();
      ctx.translate(g.x, g.y);
      ctx.rotate(g.rot);

      if (g.landed) {
        // Golden sparkle halo on rooftop landing
        const progress = g.landedTimer / 45;
        const alpha = Math.max(0, 1 - progress);
        ctx.beginPath();
        ctx.arc(0, 0, g.size * (0.9 + progress * 1.4), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(250, 204, 21, ${alpha * 0.45})`;
        ctx.fill();
        ctx.globalAlpha = Math.max(0, 1 - progress * 0.85);
      }

      const s = g.size;
      // Box body
      ctx.fillStyle = g.color;
      ctx.fillRect(-s / 2, -s / 2, s, s);

      // Ribbon cross
      ctx.fillStyle = g.ribbon;
      ctx.fillRect(-s * 0.14, -s / 2, s * 0.28, s);
      ctx.fillRect(-s / 2, -s * 0.14, s, s * 0.28);

      // Bow loops on top
      ctx.beginPath();
      ctx.ellipse(-s * 0.18, -s / 2 - 2.5, s * 0.18, s * 0.12, -0.35, 0, Math.PI * 2);
      ctx.ellipse(s * 0.18, -s / 2 - 2.5, s * 0.18, s * 0.12, 0.35, 0, Math.PI * 2);
      ctx.fillStyle = g.ribbon;
      ctx.fill();

      ctx.restore();
    };

    const renderFrame = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Update & Draw Snowflakes
      for (const f of flakes) {
        if (isAnimating) {
          f.x += f.vx + Math.sin(frameCount * 0.015 + f.r) * 0.25;
          f.y += f.vy;
          if (f.y > height + 6) {
            f.y = -6;
            f.x = Math.random() * width;
          }
          if (f.x > width + 6) f.x = -6;
          if (f.x < -6) f.x = width + 6;
        }
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(241, 245, 249, ${f.alpha})`;
        ctx.fill();
      }

      // 2. Santa Flight & Gift Drops
      if (isAnimating) {
        santaX += santaSpeed;
        if (santaX > width + 340) {
          santaX = -340;
        }

        const baseSkyY = Math.min(138, Math.max(78, height * 0.14));
        const santaY = baseSkyY + Math.sin(santaX * 0.008) * 18;

        if (santaRef.current) {
          const tilt = Math.cos(santaX * 0.008) * 3.5;
          santaRef.current.style.transform = `translate3d(${santaX}px, ${santaY}px, 0) rotate(${tilt}deg)`;
        }

        // Drop a present every ~75 frames when Santa is inside the visible city corridor
        if (frameCount % 72 === 0 && santaX > 40 && santaX < width - 80) {
          const theme = GIFT_THEMES[giftIdCounter % GIFT_THEMES.length];
          gifts.push({
            id: giftIdCounter++,
            x: santaX + 42,
            y: santaY + 34,
            vx: (Math.random() - 0.3) * 0.65,
            vy: 1.35 + Math.random() * 0.65,
            rot: (Math.random() - 0.5) * 0.4,
            vRot: (Math.random() - 0.5) * 0.035,
            color: theme.color,
            ribbon: theme.ribbon,
            size: 14 + Math.random() * 5,
            landed: false,
            landedTimer: 0,
          });
        }
      } else if (santaRef.current) {
        santaRef.current.style.transform = `translate3d(${Math.min(width * 0.62, width - 320)}px, 92px, 0)`;
      }

      // 3. Update & Draw Falling Gifts landing on the city rooftops (~height - 76px)
      const rooftopLine = height - 74;
      for (let i = gifts.length - 1; i >= 0; i--) {
        const g = gifts[i];
        if (isAnimating) {
          if (!g.landed) {
            g.x += g.vx + Math.sin(frameCount * 0.04 + g.id) * 0.25;
            g.y += g.vy;
            g.vy = Math.min(2.6, g.vy + 0.015);
            g.rot += g.vRot;

            // Trail sparkle while falling
            ctx.beginPath();
            ctx.arc(g.x, g.y - 12, 1.8, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(253, 224, 71, 0.6)';
            ctx.fill();

            if (g.y >= rooftopLine) {
              g.y = rooftopLine;
              g.landed = true;
              g.rot = 0;
            }
          } else {
            g.landedTimer += 1;
            if (g.landedTimer > 45) {
              gifts.splice(i, 1);
              continue;
            }
          }
        }
        drawGift(g);
      }

      frameCount++;
      if (isAnimating) {
        rafId = requestAnimationFrame(renderFrame);
      }
    };

    renderFrame();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [isAnimating]);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-0 overflow-hidden pointer-events-none select-none no-print"
      style={{
        background:
          'radial-gradient(ellipse at 50% 0%, #173a5e 0%, #0d223b 48%, #071323 100%)',
      }}
    >
      {/* Lua cheia natalina suave */}
      <div
        className="absolute top-12 right-[10%] w-20 h-20 rounded-full opacity-90"
        style={{
          background: 'radial-gradient(circle at 35% 35%, #fef9c3 0%, #fde68a 60%, #f59e0b 100%)',
          boxShadow: '0 0 55px 14px rgba(253, 230, 138, 0.22)',
        }}
      />

      {/* Estrelas cintilantes */}
      {STARS.map((star, idx) => (
        <span
          key={idx}
          style={{
            left: star.x,
            top: star.y,
            width: `${star.size}px`,
            height: `${star.size}px`,
            animationDelay: star.delay,
          }}
          className={`absolute rounded-full bg-amber-100 ${
            isAnimating ? 'animate-star' : 'opacity-70'
          }`}
        />
      ))}

      {/* Papai Noel voando com trenó e renas */}
      <div
        ref={santaRef}
        className="absolute top-0 left-0 will-change-transform"
        style={{ width: 290, height: 76 }}
      >
        <svg
          viewBox="0 0 320 84"
          className="w-full h-full drop-shadow-[0_4px_12px_rgba(0,0,0,0.45)]"
          fill="none"
        >
          {/* Rastro mágico dourado atrás do trenó */}
          <path
            d="M4,54 Q30,49 52,54"
            stroke="rgba(250, 204, 21, 0.45)"
            strokeWidth="2"
            strokeDasharray="4 4"
          />

          {/* Trenó do Papai Noel */}
          <path
            d="M32,62 C44,62 96,62 110,60 C118,59 122,52 118,48"
            stroke="#facc15"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path d="M46,62 L46,54 M96,61 L96,54" stroke="#facc15" strokeWidth="2.2" />
          <path
            d="M36,44 L44,55 L98,55 L108,42 L94,42 L86,47 L56,47 L46,38 Z"
            fill="#b91c1c"
            stroke="#fde047"
            strokeWidth="1.5"
          />

          {/* Saco de presentes no trenó */}
          <ellipse cx="56" cy="41" rx="11" ry="9" fill="#92400e" />
          <rect x="49" y="31" width="7" height="7" rx="1" fill="#16a34a" />
          <rect x="57" y="33" width="6" height="6" rx="1" fill="#facc15" />

          {/* Papai Noel */}
          <circle cx="77" cy="39" r="8" fill="#dc2626" />
          <circle cx="78" cy="29" r="5" fill="#fed7aa" />
          {/* Barba */}
          <path d="M74,31 Q78,37 83,31 Z" fill="#ffffff" />
          {/* Gorro */}
          <path d="M73,26 Q78,18 85,25 Z" fill="#dc2626" />
          <circle cx="72" cy="23" r="2" fill="#ffffff" />
          {/* Braço acenando */}
          <path d="M82,36 L90,29" stroke="#dc2626" strokeWidth="3.2" strokeLinecap="round" />

          {/* Rédeas */}
          <path
            d="M90,39 Q130,45 162,40 M90,41 Q165,48 214,40 M90,42 Q205,50 264,39"
            stroke="rgba(253, 224, 71, 0.65)"
            strokeWidth="1.1"
          />

          {/* 3 Renas + Rodolfo na frente */}
          {[
            { x: 152, y: 38, isRudolph: false },
            { x: 202, y: 36, isRudolph: false },
            { x: 254, y: 34, isRudolph: true },
          ].map((deer, idx) => (
            <g key={idx} transform={`translate(${deer.x}, ${deer.y})`}>
              {/* Corpo */}
              <ellipse cx="14" cy="12" rx="11" ry="5.5" fill="#92400e" />
              {/* Pernas galopando */}
              <path
                d="M6,16 L2,25 M10,16 L13,24 M20,16 L25,24 M23,15 L29,21"
                stroke="#78350f"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
              {/* Pescoço e Cabeça */}
              <path d="M21,10 L27,3 L34,5 L33,9 L25,12 Z" fill="#92400e" />
              {/* Chifres */}
              <path
                d="M27,3 L25,-4 M25,-1 L22,-3 M29,3 L30,-4 M30,-1 L33,-3"
                stroke="#fde68a"
                strokeWidth="1.3"
                strokeLinecap="round"
              />
              {/* Coleira dourada */}
              <path d="M21,9 L26,11" stroke="#facc15" strokeWidth="2" />
              {/* Nariz brilhante do Rodolfo */}
              {deer.isRudolph && (
                <circle
                  cx="35"
                  cy="6.5"
                  r="2.6"
                  fill="#ef4444"
                  style={{ filter: 'drop-shadow(0 0 6px #ef4444)' }}
                />
              )}
            </g>
          ))}
        </svg>
      </div>

      {/* Canvas para neve e presentes caindo sobre a cidade */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Horizonte nevado da cidade com casas, escola, pinheiros e janelas iluminadas */}
      <div className="absolute bottom-0 inset-x-0 h-36">
        <svg
          viewBox="0 0 1440 160"
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          {/* Colinas nevadas distantes */}
          <path
            d="M0,115 Q240,80 480,110 T960,104 T1440,115 L1440,160 L0,160 Z"
            fill="#0b1b30"
          />

          {/* Silhueta da Cidade com Telhados Nevados */}
          {/* Casa 1 */}
          <rect x="45" y="96" width="66" height="50" fill="#10253f" />
          <polygon points="38,98 78,68 118,98" fill="#163254" />
          <polyline points="38,98 78,68 118,98" fill="none" stroke="#e2e8f0" strokeWidth="3.5" strokeLinecap="round" />
          <rect x="58" y="108" width="12" height="14" fill="#fbbf24" opacity="0.9" />
          <rect x="84" y="108" width="12" height="14" fill="#fde68a" opacity="0.85" />

          {/* Pinheiro 1 */}
          <polygon points="145,146 164,86 183,146" fill="#0f3d2e" />
          <polygon points="151,116 164,74 177,116" fill="#14532d" />

          {/* Prédio / Casa 2 */}
          <rect x="200" y="84" width="76" height="62" fill="#0e223a" />
          <rect x="196" y="81" width="84" height="5" rx="2" fill="#e2e8f0" />
          <rect x="212" y="96" width="10" height="12" fill="#fde68a" opacity="0.8" />
          <rect x="233" y="96" width="10" height="12" fill="#fbbf24" opacity="0.9" />
          <rect x="254" y="96" width="10" height="12" fill="#fde68a" opacity="0.7" />
          <rect x="212" y="116" width="10" height="12" fill="#fbbf24" opacity="0.85" />
          <rect x="254" y="116" width="10" height="12" fill="#fbbf24" opacity="0.85" />

          {/* Escola do Campo (Torre & Telhado) */}
          <rect x="330" y="92" width="110" height="54" fill="#122946" />
          <polygon points="322,93 385,62 448,93" fill="#1b3a60" />
          <polyline points="322,93 385,62 448,93" fill="none" stroke="#f1f5f9" strokeWidth="3.5" />
          <rect x="373" y="42" width="24" height="26" fill="#163254" />
          <polygon points="369,43 385,26 401,43" fill="#b91c1c" />
          <circle cx="385" cy="54" r="5" fill="#fde68a" />
          <rect x="344" y="104" width="14" height="16" fill="#fbbf24" />
          <rect x="378" y="104" width="14" height="16" fill="#fde68a" />
          <rect x="412" y="104" width="14" height="16" fill="#fbbf24" />

          {/* Pinheiros centrais */}
          <polygon points="480,146 498,90 516,146" fill="#14532d" />
          <polygon points="512,146 526,102 540,146" fill="#0f3d2e" />

          {/* Casario central direito */}
          <rect x="575" y="98" width="72" height="48" fill="#10253f" />
          <polygon points="569,99 611,72 653,99" fill="#163254" />
          <polyline points="569,99 611,72 653,99" fill="none" stroke="#e2e8f0" strokeWidth="3" />
          <rect x="590" y="110" width="12" height="14" fill="#fbbf24" />
          <rect x="618" y="110" width="12" height="14" fill="#fde68a" />

          {/* Igreja / Torre nevada */}
          <rect x="740" y="88" width="60" height="58" fill="#112742" />
          <polygon points="754,88 770,34 786,88" fill="#18365b" />
          <polyline points="754,88 770,34 786,88" fill="none" stroke="#f1f5f9" strokeWidth="2.5" />
          <rect x="763" y="104" width="14" height="20" rx="7" fill="#fbbf24" />

          {/* Pinheiro iluminado */}
          <polygon points="860,146 882,76 904,146" fill="#14532d" />
          <circle cx="882" cy="75" r="3" fill="#facc15" />
          <circle cx="876" cy="105" r="2.2" fill="#ef4444" />
          <circle cx="889" cy="120" r="2.2" fill="#38bdf8" />
          <circle cx="873" cy="130" r="2.2" fill="#facc15" />

          {/* Prédio Residencial */}
          <rect x="955" y="80" width="82" height="66" fill="#0f233c" />
          <rect x="951" y="77" width="90" height="5" rx="2" fill="#e2e8f0" />
          <rect x="968" y="92" width="11" height="13" fill="#fde68a" />
          <rect x="990" y="92" width="11" height="13" fill="#fbbf24" />
          <rect x="1012" y="92" width="11" height="13" fill="#fde68a" />
          <rect x="968" y="114" width="11" height="13" fill="#fbbf24" />
          <rect x="1012" y="114" width="11" height="13" fill="#fbbf24" />

          {/* Chalé com chaminé */}
          <rect x="1105" y="98" width="76" height="48" fill="#122946" />
          <rect x="1156" y="70" width="10" height="22" fill="#1e3a5f" />
          <polygon points="1098,99 1143,70 1188,99" fill="#18365b" />
          <polyline points="1098,99 1143,70 1188,99" fill="none" stroke="#f1f5f9" strokeWidth="3.5" />
          <rect x="1120" y="110" width="13" height="14" fill="#fbbf24" />
          <rect x="1150" y="110" width="13" height="14" fill="#fde68a" />

          {/* Pinheiros direita */}
          <polygon points="1225,146 1244,88 1263,146" fill="#0f3d2e" />
          <polygon points="1355,146 1378,80 1401,146" fill="#14532d" />

          {/* Casa 5 */}
          <rect x="1280" y="96" width="66" height="50" fill="#10253f" />
          <polygon points="1274,97 1313,69 1352,97" fill="#163254" />
          <polyline points="1274,97 1313,69 1352,97" fill="none" stroke="#f1f5f9" strokeWidth="3" />
          <rect x="1294" y="109" width="12" height="14" fill="#fde68a" />
          <rect x="1320" y="109" width="12" height="14" fill="#fbbf24" />

          {/* Solo nevado frontal */}
          <path
            d="M0,142 Q360,132 720,142 T1440,138 L1440,160 L0,160 Z"
            fill="#e2e8f0"
          />
          <path
            d="M0,148 Q420,140 840,148 T1440,145 L1440,160 L0,160 Z"
            fill="#f8fafc"
          />
        </svg>

        {/* Fumaça da chaminé */}
        {isAnimating && (
          <div className="hidden md:block absolute right-[18.8%] bottom-[92px] w-3 h-3 rounded-full bg-slate-200/40 animate-smoke" />
        )}
      </div>
    </div>
  );
};
