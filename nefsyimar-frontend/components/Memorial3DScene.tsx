'use client'

import { useEffect, useRef, useState } from 'react'
import { Wind, Move3D } from 'lucide-react'
import { HeadstoneStone, type HeadstoneStoneMemorial } from './HeadstoneMemorial'

interface Memorial3DSceneProps {
  memorial: HeadstoneStoneMemorial
}

// Deterministic grass tuft generator — produces many lush tufts with varied
// hues, heights, and animation phases for a realistic green-grass meadow.
type GrassTuft = {
  leftPct: number
  bottomPx: number
  heightPx: number
  width: number
  hue: number
  light: number
  delay: number
  duration: number
  zIndex: number
  scale: number
}

function buildTufts(count: number, seed: number): GrassTuft[] {
  const tufts: GrassTuft[] = []
  for (let i = 0; i < count; i += 1) {
    const r = ((i + seed) * 9301 + 49297) % 233280
    const r2 = ((i + seed * 2) * 75743 + 87013) % 233280
    const r3 = ((i + seed * 3) * 13007 + 11003) % 233280
    const leftPct = (r / 233280) * 100
    const bottomPx = ((r2 / 233280) * 60) | 0
    const heightPx = 8 + ((r2 / 233280) * 28) | 0
    const width = 3 + ((r3 / 233280) * 4) | 0
    const hue = 95 + ((r2 / 233280) * 30) | 0 // 95–125 -> green range
    const light = 28 + ((r3 / 233280) * 22) | 0 // 28–50%
    const delay = (r / 233280) * 4
    const duration = 2.5 + (r2 / 233280) * 3
    const zIndex = bottomPx > 30 ? 1 : 5 // closer tufts in front
    const scale = 0.85 + (r3 / 233280) * 0.6
    tufts.push({ leftPct, bottomPx, heightPx, width, hue, light, delay, duration, zIndex, scale })
  }
  return tufts
}

export default function Memorial3DScene({ memorial }: Memorial3DSceneProps) {
  const sceneRef = useRef<HTMLDivElement | null>(null)
  // Mouse offsets drive ONLY the grass parallax; stone stays put.
  const [grassOffset, setGrassOffset] = useState({ x: 0, y: 0 })
  const [windPhase, setWindPhase] = useState(0)
  const [hovering, setHovering] = useState(false)
  const targetOffset = useRef({ x: 0, y: 0 })

  const grassFront = useRef<GrassTuft[]>(buildTufts(60, 7)) // dense front layer
  const grassMid = useRef<GrassTuft[]>(buildTufts(36, 19)) // mid layer
  const grassBack = useRef<GrassTuft[]>(buildTufts(28, 31)) // back layer

  const onPointerMove = (e: React.PointerEvent) => {
    if (!sceneRef.current) return
    const rect = sceneRef.current.getBoundingClientRect()
    const cx = e.clientX - rect.left - rect.width / 2
    const cy = e.clientY - rect.top - rect.height / 2
    targetOffset.current = {
      x: Math.max(-1, Math.min(1, cx / (rect.width / 2))),
      y: Math.max(-1, Math.min(1, cy / (rect.height / 2))),
    }
    setHovering(true)
  }

  const onPointerLeave = () => {
    setHovering(false)
    targetOffset.current = { x: 0, y: 0 }
  }

  // Smoothly ease the grass toward the cursor offset and animate wind sway
  useEffect(() => {
    let raf: number
    const tick = () => {
      setGrassOffset((prev) => ({
        x: prev.x + (targetOffset.current.x - prev.x) * 0.08,
        y: prev.y + (targetOffset.current.y - prev.y) * 0.08,
      }))
      setWindPhase((p) => (p + 0.012) % (Math.PI * 2))
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  const windPx = Math.sin(windPhase) * 4 // gentle global wind sway in px

  const renderTufts = (tufts: GrassTuft[], parallax: number) => (
    <>
      {tufts.map((t, i) => {
        const baseOffset = grassOffset.x * parallax * 12 + windPx * (parallax * 0.6)
        const skew = grassOffset.x * parallax * 8 + Math.sin(windPhase + i) * 2
        return (
          <span
            key={i}
            style={{
              position: 'absolute',
              left: `${t.leftPct}%`,
              bottom: `${t.bottomPx}px`,
              width: `${t.width}px`,
              height: `${t.heightPx}px`,
              background: `linear-gradient(180deg, hsl(${t.hue}, 65%, ${Math.min(
                70,
                t.light + 22,
              )}%) 0%, hsl(${t.hue}, 60%, ${t.light}%) 60%, hsl(${t.hue}, 55%, ${Math.max(
                14,
                t.light - 12,
              )}%) 100%)`,
              borderRadius: '2px 2px 0 0',
              transformOrigin: 'bottom center',
              transform: `translateX(${baseOffset}px) rotate(${skew}deg) scale(${t.scale})`,
              zIndex: t.zIndex,
              boxShadow: '0 1px 0 rgba(0,0,0,0.25)',
              animation: `bladeSway ${t.duration}s ease-in-out ${t.delay}s infinite alternate`,
              willChange: 'transform',
            }}
          />
        )
      })}
    </>
  )

  return (
    <div
      ref={sceneRef}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className="relative w-full rounded-3xl overflow-hidden border border-accent-500/30 select-none cursor-default"
      style={{
        background:
          'radial-gradient(ellipse at top, #1a2238 0%, #0a0a16 65%, #050510 100%)',
      }}
    >
      {/* Sky atmosphere */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(180deg, rgba(30,40,70,0.7) 0%, rgba(15,15,26,0.4) 50%, rgba(10,20,15,0) 100%)',
        }}
      ></div>

      {/* Twinkling stars */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 35 }).map((_, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: i % 5 === 0 ? '3px' : '2px',
              height: i % 5 === 0 ? '3px' : '2px',
              left: `${(i * 31) % 100}%`,
              top: `${(i * 13) % 50}%`,
              opacity: 0.3 + (i % 4) * 0.15,
              boxShadow: '0 0 6px rgba(255,255,255,0.5)',
              animation: `twinkle ${3 + (i % 5)}s ease-in-out ${i * 0.13}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Distant rolling hills */}
      <div className="absolute left-0 right-0 top-[55%] h-24 pointer-events-none">
        <svg viewBox="0 0 800 100" preserveAspectRatio="none" className="w-full h-full">
          <path
            d="M0,70 Q150,30 300,60 T600,55 T800,65 L800,100 L0,100 Z"
            fill="hsl(120, 25%, 12%)"
            opacity="0.85"
          />
          <path
            d="M0,80 Q200,55 400,75 T800,78 L800,100 L0,100 Z"
            fill="hsl(115, 30%, 9%)"
          />
        </svg>
      </div>

      {/* The 3D viewport */}
      <div className="relative h-[520px] md:h-[620px] flex items-end justify-center" style={{ perspective: '1400px' }}>
        {/* GREEN GRASS GROUND PLANE */}
        <div
          className="absolute bottom-0 left-1/2 origin-bottom"
          style={{
            transform: `translateX(-50%) rotateX(70deg) translateY(${grassOffset.y * 8}px) translateX(${grassOffset.x * 14}px)`,
            transformStyle: 'preserve-3d',
            transformOrigin: '50% 100%',
            width: '220%',
            height: '85%',
            background:
              'radial-gradient(ellipse at center, hsl(110, 50%, 32%) 0%, hsl(115, 45%, 22%) 35%, hsl(120, 50%, 14%) 70%, hsl(125, 55%, 7%) 95%)',
            boxShadow: 'inset 0 -160px 100px rgba(0,0,0,0.6), inset 0 0 200px rgba(0,0,0,0.4)',
            transition: 'transform 0.18s ease-out',
          }}
        >
          {/* Grass blade texture (very fine repeating lines) */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "repeating-linear-gradient(86deg, rgba(40,80,40,0.5) 0 1px, transparent 1px 4px), repeating-linear-gradient(94deg, rgba(180,220,150,0.08) 0 1px, transparent 1px 6px)",
              opacity: 0.6,
            }}
          />
          {/* Soft light patch */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse at 50% 30%, rgba(255,240,170,0.18) 0%, rgba(0,0,0,0) 60%)',
            }}
          />
        </div>

        {/* HEADSTONE — completely fixed in place; no rotation/parallax */}
        <div
          className="relative"
          style={{
            marginBottom: '95px',
            zIndex: 4,
          }}
        >
          {/* Base plinth */}
          <div
            className="absolute left-1/2 -translate-x-1/2 rounded-md"
            style={{
              bottom: '-34px',
              width: '320px',
              height: '26px',
              background: 'linear-gradient(180deg, #5e5a52 0%, #2a2722 100%)',
              boxShadow:
                '0 14px 32px rgba(0,0,0,0.65), inset 0 2px 4px rgba(255,255,255,0.08)',
            }}
          />
          {/* Shadow on grass */}
          <div
            className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
            style={{
              bottom: '-58px',
              width: '320px',
              height: '46px',
              background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0) 70%)',
              filter: 'blur(10px)',
            }}
          />
          {/* Stone */}
          <div
            style={{
              filter:
                'drop-shadow(0 30px 30px rgba(0,0,0,0.55)) drop-shadow(0 0 22px rgba(212,168,83,0.16))',
            }}
          >
            <HeadstoneStone memorial={memorial} width={300} height={400} />
          </div>
        </div>

        {/* GRASS LAYERS — back -> mid -> front for depth, all parallax with cursor */}
        <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none" style={{ zIndex: 3 }}>
          {renderTufts(grassBack.current, 0.4)}
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none" style={{ zIndex: 5 }}>
          {renderTufts(grassMid.current, 0.7)}
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none" style={{ zIndex: 6 }}>
          {renderTufts(grassFront.current, 1)}
          {/* Front green strip */}
          <div
            className="absolute bottom-0 left-0 right-0 h-12"
            style={{
              background:
                'linear-gradient(180deg, rgba(60,110,55,0.0) 0%, rgba(50,100,50,0.6) 50%, rgba(30,70,35,0.95) 100%)',
            }}
          />
        </div>

        {/* Vignette */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ boxShadow: 'inset 0 0 140px 36px rgba(0,0,0,0.6)' }}
        />
      </div>

      {/* Hint */}
      <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-3 py-1.5 bg-primary-900/70 backdrop-blur border border-accent-400/30 rounded-full text-[11px] text-accent-200 z-30">
        <Wind className="w-3.5 h-3.5 text-accent-400" />
        <span>{hovering ? 'The grass sways with you' : 'Move your cursor — the grass responds'}</span>
      </div>

      {/* Engraved-style label */}
      <div className="absolute top-3 right-3 z-30 px-3 py-1.5 bg-primary-900/70 backdrop-blur border border-accent-400/30 rounded-full text-[11px] uppercase tracking-[0.2em] text-accent-300 font-engraved flex items-center gap-1.5">
        <Move3D className="w-3.5 h-3.5 text-accent-400" />
        Resting Place
      </div>

      <style jsx>{`
        @keyframes bladeSway {
          0% { transform-origin: bottom center; }
          100% { filter: brightness(1.05); }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.25; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  )
}
