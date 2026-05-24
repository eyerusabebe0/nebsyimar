'use client'

export interface HeadstoneStoneMemorial {
  name: string
  dates: string
  image: string
  headstoneDesign?: string
}

interface Memorial extends HeadstoneStoneMemorial {
  totalTributes: number
  totalAmount: number
}

interface HeadstoneMemorialProps {
  memorial: Memorial
}

// Per-stone engraving configuration.
// The "face" rectangle (percent of the rendered image box) defines where photo/name/dates appear.
// Inner photo/name/dates positions are percentages of that face rectangle.
// `transform` matches the stone's visible angle so the engraving sits flat on the stone.
type StoneConfig = {
  src: string
  face: { top: string; left: string; width: string; height: string }
  transform?: string // CSS transform applied to the engraving overlay
  photo: { top: string; widthPct: number; aspect: number; shape: 'oval' | 'circle' | 'heart' | 'rect' }
  name: {
    top: string
    color: string
    baseFontSize: number
    curve?: boolean
    family?: string
    shadow?: string
    letterSpacing?: string
    maxChars: number
  }
  dates: {
    top: string
    color: string
    baseFontSize: number
    family?: string
    shadow?: string
  }
}

const ENGRAVED_DARK_SHADOW =
  '0 1px 0 rgba(255,255,255,0.18), 0 -1px 0 rgba(0,0,0,0.55), 1px 1px 2px rgba(0,0,0,0.6)'
const ENGRAVED_LIGHT_SHADOW =
  '0 1px 0 rgba(255,255,255,0.08), 0 -1px 0 rgba(0,0,0,0.35), 1px 1px 2px rgba(0,0,0,0.45)'
const ENGRAVED_GOLD_SHADOW =
  '0 1px 0 rgba(255,255,255,0.2), 0 0 6px rgba(212,168,83,0.35), 1px 1px 1px rgba(0,0,0,0.6)'

const STONE_CONFIGS: Record<string, StoneConfig> = {
  // Irregular brown rock, slightly leans
  stone_1: {
    src: '/STONES/stone_1.png',
    face: { top: '24%', left: '34%', width: '42%', height: '58%' },
    transform: 'rotate(-3deg) skewY(-2deg)',
    photo: { top: '2%', widthPct: 55, aspect: 1.25, shape: 'oval' },
    name: {
      top: '60%',
      color: '#f5ecd6',
      baseFontSize: 14,
      curve: false,
      family: '"Cinzel Decorative", "Cinzel", "IM Fell English SC", Georgia, serif',
      shadow: ENGRAVED_GOLD_SHADOW,
      letterSpacing: '1px',
      maxChars: 16,
    },
    dates: {
      top: '82%',
      color: '#e6d8b3',
      baseFontSize: 11,
      family: '"Cinzel Decorative", "Cinzel", "IM Fell English SC", Georgia, serif',
      shadow: ENGRAVED_GOLD_SHADOW,
    },
  },
  // Classic dark granite arched
  stone_2: {
    src: '/STONES/stone_2.png',
    face: { top: '10%', left: '18%', width: '64%', height: '55%' },
    photo: { top: '0%', widthPct: 38, aspect: 1.25, shape: 'oval' },
    name: {
      top: '60%',
      color: '#f3eedd',
      baseFontSize: 18,
      curve: true,
      family: '"Cinzel Decorative", "Cinzel", "IM Fell English SC", Georgia, serif',
      shadow: ENGRAVED_DARK_SHADOW,
      letterSpacing: '2px',
      maxChars: 18,
    },
    dates: {
      top: '85%',
      color: '#e8e0c4',
      baseFontSize: 13,
      family: '"Cinzel Decorative", "Cinzel", "IM Fell English SC", Georgia, serif',
      shadow: ENGRAVED_DARK_SHADOW,
    },
  },
  // Black granite arched (with roses)
  stone_3: {
    src: '/STONES/stone_3.png',
    face: { top: '10%', left: '20%', width: '60%', height: '50%' },
    photo: { top: '0%', widthPct: 36, aspect: 1.25, shape: 'oval' },
    name: {
      top: '58%',
      color: '#f5d98b',
      baseFontSize: 17,
      curve: true,
      family: '"Cinzel Decorative", "Cinzel", "IM Fell English SC", Georgia, serif',
      shadow: ENGRAVED_GOLD_SHADOW,
      letterSpacing: '2px',
      maxChars: 18,
    },
    dates: {
      top: '85%',
      color: '#e8c97a',
      baseFontSize: 13,
      family: '"Cinzel Decorative", "Cinzel", "IM Fell English SC", Georgia, serif',
      shadow: ENGRAVED_GOLD_SHADOW,
    },
  },
  // Cream/beige rounded plain stone
  stone_4: {
    src: '/STONES/stone_4.png',
    face: { top: '8%', left: '20%', width: '58%', height: '62%' },
    photo: { top: '0%', widthPct: 42, aspect: 1.25, shape: 'oval' },
    name: {
      top: '62%',
      color: '#3b2f1d',
      baseFontSize: 17,
      curve: true,
      family: '"Cinzel Decorative", "Cinzel", "IM Fell English SC", Georgia, serif',
      shadow: '0 1px 0 rgba(255,255,255,0.5), 1px 1px 2px rgba(0,0,0,0.35)',
      letterSpacing: '2px',
      maxChars: 18,
    },
    dates: {
      top: '86%',
      color: '#4a3a22',
      baseFontSize: 13,
      family: '"Cinzel Decorative", "Cinzel", "IM Fell English SC", Georgia, serif',
      shadow: '0 1px 0 rgba(255,255,255,0.4), 1px 1px 2px rgba(0,0,0,0.3)',
    },
  },
  // Tan stone with 3D angle (faces right)
  stone_5: {
    src: '/STONES/stone_5.png',
    face: { top: '14%', left: '34%', width: '44%', height: '54%' },
    transform: 'perspective(900px) rotateY(-14deg) skewY(-2deg)',
    photo: { top: '0%', widthPct: 45, aspect: 1.25, shape: 'oval' },
    name: {
      top: '60%',
      color: '#3a2f1c',
      baseFontSize: 15,
      curve: false,
      family: '"Cinzel Decorative", "Cinzel", "IM Fell English SC", Georgia, serif',
      shadow: '0 1px 0 rgba(255,255,255,0.45), 1px 1px 2px rgba(0,0,0,0.4)',
      letterSpacing: '1.5px',
      maxChars: 16,
    },
    dates: {
      top: '85%',
      color: '#4a3a22',
      baseFontSize: 12,
      family: '"Cinzel Decorative", "Cinzel", "IM Fell English SC", Georgia, serif',
      shadow: '0 1px 0 rgba(255,255,255,0.4), 1px 1px 2px rgba(0,0,0,0.3)',
    },
  },
  // Ornate white marble with arch - inscription on central panel
  stone_6: {
    src: '/STONES/stone_6.png',
    face: { top: '28%', left: '40%', width: '26%', height: '36%' },
    transform: 'perspective(900px) rotateY(-6deg)',
    photo: { top: '0%', widthPct: 70, aspect: 1.25, shape: 'oval' },
    name: {
      top: '70%',
      color: '#3a3024',
      baseFontSize: 10,
      family: '"Cinzel Decorative", "Cinzel", "IM Fell English SC", Georgia, serif',
      shadow: '0 1px 0 rgba(255,255,255,0.35), 1px 1px 1px rgba(0,0,0,0.3)',
      letterSpacing: '0.5px',
      maxChars: 14,
    },
    dates: {
      top: '88%',
      color: '#4a3a22',
      baseFontSize: 8,
      family: '"Cinzel Decorative", "Cinzel", "IM Fell English SC", Georgia, serif',
      shadow: '0 1px 0 rgba(255,255,255,0.3)',
    },
  },
  // Gray granite, plain face with vegetation
  stone_7: {
    src: '/STONES/stone_7.png',
    face: { top: '14%', left: '38%', width: '34%', height: '46%' },
    photo: { top: '0%', widthPct: 60, aspect: 1.2, shape: 'oval' },
    name: {
      top: '64%',
      color: '#2c2c2c',
      baseFontSize: 12,
      family: '"Cinzel Decorative", "Cinzel", "IM Fell English SC", Georgia, serif',
      shadow: '0 1px 0 rgba(255,255,255,0.45), 1px 1px 1px rgba(0,0,0,0.3)',
      letterSpacing: '1px',
      maxChars: 14,
    },
    dates: {
      top: '85%',
      color: '#3a3a3a',
      baseFontSize: 9,
      family: '"Cinzel Decorative", "Cinzel", "IM Fell English SC", Georgia, serif',
      shadow: '0 1px 0 rgba(255,255,255,0.35)',
    },
  },
  // Tall black granite with cross + flowers
  stone_8: {
    src: '/STONES/stone_8.png',
    face: { top: '14%', left: '14%', width: '46%', height: '64%' },
    photo: { top: '0%', widthPct: 55, aspect: 1.2, shape: 'oval' },
    name: {
      top: '60%',
      color: '#f5d98b',
      baseFontSize: 13,
      curve: true,
      family: '"Cinzel Decorative", "Cinzel", "IM Fell English SC", Georgia, serif',
      shadow: ENGRAVED_GOLD_SHADOW,
      letterSpacing: '1px',
      maxChars: 18,
    },
    dates: {
      top: '85%',
      color: '#e8c97a',
      baseFontSize: 10,
      family: '"Cinzel Decorative", "Cinzel", "IM Fell English SC", Georgia, serif',
      shadow: ENGRAVED_GOLD_SHADOW,
    },
  },
  // Black granite heart with angel
  stone_9: {
    src: '/STONES/stone_9.png',
    face: { top: '20%', left: '38%', width: '38%', height: '40%' },
    photo: { top: '6%', widthPct: 55, aspect: 1.1, shape: 'heart' },
    name: {
      top: '70%',
      color: '#f5d98b',
      baseFontSize: 10,
      family: '"Cinzel Decorative", "Cinzel", "IM Fell English SC", Georgia, serif',
      shadow: ENGRAVED_GOLD_SHADOW,
      letterSpacing: '0.5px',
      maxChars: 14,
    },
    dates: {
      top: '88%',
      color: '#e8c97a',
      baseFontSize: 8,
      family: '"Cinzel Decorative", "Cinzel", "IM Fell English SC", Georgia, serif',
      shadow: ENGRAVED_GOLD_SHADOW,
    },
  },
  // Dark mausoleum with central inscribed panel
  stone_10: {
    src: '/STONES/stone_10.png',
    face: { top: '28%', left: '40%', width: '22%', height: '38%' },
    transform: 'perspective(900px) rotateY(-8deg)',
    photo: { top: '0%', widthPct: 80, aspect: 1.2, shape: 'oval' },
    name: {
      top: '70%',
      color: '#f5d98b',
      baseFontSize: 9,
      family: '"Cinzel Decorative", "Cinzel", "IM Fell English SC", Georgia, serif',
      shadow: ENGRAVED_GOLD_SHADOW,
      letterSpacing: '0.5px',
      maxChars: 12,
    },
    dates: {
      top: '88%',
      color: '#e8c97a',
      baseFontSize: 7,
      family: '"Cinzel Decorative", "Cinzel", "IM Fell English SC", Georgia, serif',
      shadow: ENGRAVED_GOLD_SHADOW,
    },
  },
  // White marble mausoleum dome - central panel
  stone_11: {
    src: '/STONES/stone_11.png',
    face: { top: '38%', left: '38%', width: '24%', height: '34%' },
    transform: 'perspective(900px) rotateY(-8deg)',
    photo: { top: '0%', widthPct: 75, aspect: 1.2, shape: 'oval' },
    name: {
      top: '68%',
      color: '#3a3024',
      baseFontSize: 9,
      family: '"Cinzel Decorative", "Cinzel", "IM Fell English SC", Georgia, serif',
      shadow: '0 1px 0 rgba(255,255,255,0.45), 1px 1px 1px rgba(0,0,0,0.25)',
      letterSpacing: '0.5px',
      maxChars: 12,
    },
    dates: {
      top: '86%',
      color: '#4a3a22',
      baseFontSize: 7,
      family: '"Cinzel Decorative", "Cinzel", "IM Fell English SC", Georgia, serif',
      shadow: '0 1px 0 rgba(255,255,255,0.35)',
    },
  },
  // Dark ornate mausoleum
  stone_12: {
    src: '/STONES/stone_12.png',
    face: { top: '42%', left: '42%', width: '20%', height: '30%' },
    transform: 'perspective(900px) rotateY(-8deg)',
    photo: { top: '0%', widthPct: 75, aspect: 1.2, shape: 'oval' },
    name: {
      top: '68%',
      color: '#f5d98b',
      baseFontSize: 8,
      family: '"Cinzel Decorative", "Cinzel", "IM Fell English SC", Georgia, serif',
      shadow: ENGRAVED_GOLD_SHADOW,
      letterSpacing: '0.5px',
      maxChars: 12,
    },
    dates: {
      top: '86%',
      color: '#e8c97a',
      baseFontSize: 6,
      family: '"Cinzel Decorative", "Cinzel", "IM Fell English SC", Georgia, serif',
      shadow: ENGRAVED_GOLD_SHADOW,
    },
  },
  // Black granite with bust + scroll banner
  stone_13: {
    src: '/STONES/stone_13.png',
    face: { top: '22%', left: '20%', width: '60%', height: '52%' },
    photo: { top: '20%', widthPct: 25, aspect: 1.1, shape: 'oval' },
    name: {
      top: '0%',
      color: '#1a1a1a',
      baseFontSize: 13,
      curve: true,
      family: '"Cinzel Decorative", "Cinzel", "IM Fell English SC", Georgia, serif',
      shadow: '0 1px 0 rgba(255,255,255,0.45)',
      letterSpacing: '1px',
      maxChars: 18,
    },
    dates: {
      top: '80%',
      color: '#f5d98b',
      baseFontSize: 11,
      family: '"Cinzel Decorative", "Cinzel", "IM Fell English SC", Georgia, serif',
      shadow: ENGRAVED_GOLD_SHADOW,
    },
  },
}

// Aliases for legacy values used elsewhere in the codebase / db.
const STONE_ALIASES: Record<string, string> = {
  grave_stone: 'stone_2',
  grave_stone_2: 'stone_3',
  grave_stone_3: 'stone_4',
}

export function resolveStoneId(raw?: string | null): string {
  if (!raw) return 'stone_2'
  const aliased = STONE_ALIASES[raw] || raw
  return STONE_CONFIGS[aliased] ? aliased : 'stone_2'
}

export const STONE_OPTIONS_FULL: Array<{ id: string; label: string; src: string }> = Object.keys(
  STONE_CONFIGS,
).map((id) => ({ id, label: id.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase()), src: STONE_CONFIGS[id].src }))

export function HeadstoneStone({
  memorial,
  width = 320,
  height = 400,
  className = '',
}: {
  memorial: HeadstoneStoneMemorial
  width?: number
  height?: number
  className?: string
}) {
  const settingsDesign = (memorial as any)?.memorialSettings?.headstone_design as string | undefined
  const designId = resolveStoneId(memorial.headstoneDesign || settingsDesign)
  const config = STONE_CONFIGS[designId]

  // Years-only display ("YYYY - YYYY")
  const headstoneYears = (() => {
    const raw = (memorial.dates || '').trim()
    if (!raw) return ''
    const matches = raw.match(/\b\d{4}\b/g) || []
    const years = matches
      .map((y) => Number(y))
      .filter((y) => Number.isFinite(y) && y >= 1111 && y <= 9999)
    if (years.length >= 2) return `${years[0]} - ${years[1]}`
    if (years.length === 1) return String(years[0])
    return ''
  })()

  // Auto-fit name to face width
  const nameText = (memorial.name || '').trim()
  const safeNameLen = Math.max(1, nameText.length)
  const nameScale = Math.min(1, config.name.maxChars / safeNameLen)
  const baseScale = Math.min(width / 320, height / 400)
  const nameFontSize = Math.max(6, Math.round(config.name.baseFontSize * nameScale * baseScale))
  const dateFontSize = Math.max(6, Math.round(config.dates.baseFontSize * baseScale))

  // Photo computed from face width
  const photoWidthFactor = config.photo.widthPct / 100

  // Constrain photo height so it never overflows the engraving panel
  // (between the photo top and where the name begins).
  const parsePct = (v: string) => Math.max(0, Math.min(100, parseFloat(v) || 0))
  const photoTopPct = parsePct(config.photo.top)
  const nameTopPct = parsePct(config.name.top)
  const availablePct = Math.max(20, nameTopPct - photoTopPct - 4) // leave ~4% gap
  const photoMaxHeight = `${availablePct}%`

  // Heart clip path (CSS clip-path heart shape)
  const heartClip =
    'path("M 50,80 C 20,55 5,40 5,25 C 5,10 20,5 30,5 C 40,5 47,12 50,22 C 53,12 60,5 70,5 C 80,5 95,10 95,25 C 95,40 80,55 50,80 Z")'

  const photoShape =
    config.photo.shape === 'circle'
      ? '50%'
      : config.photo.shape === 'oval'
      ? '50% / 50%'
      : config.photo.shape === 'heart'
      ? '0'
      : '8px'

  return (
    <div
      className={`relative ${className}`}
      style={{ width: `${width}px`, height: `${height}px` }}
    >
      <img
        src={config.src}
        alt="Headstone"
        className="w-full h-full object-contain drop-shadow-2xl select-none pointer-events-none"
        draggable={false}
      />

      {/* Engraving face overlay, transformed to match stone angle */}
      <div
        className="absolute"
        style={{
          top: config.face.top,
          left: config.face.left,
          width: config.face.width,
          height: config.face.height,
          transform: config.transform,
          transformOrigin: 'center center',
          zIndex: 20,
        }}
      >
        {/* Photo */}
        <div
          className="absolute left-1/2 -translate-x-1/2 overflow-hidden"
          style={{
            top: config.photo.top,
            width: `${photoWidthFactor * 100}%`,
            aspectRatio: `${1} / ${config.photo.aspect}`,
            maxHeight: photoMaxHeight,
            borderRadius: photoShape,
            clipPath: config.photo.shape === 'heart' ? heartClip : undefined,
            border:
              config.photo.shape === 'heart'
                ? 'none'
                : '2px solid rgba(180,160,110,0.7)',
            boxShadow:
              'inset 0 2px 6px rgba(0,0,0,0.45), 0 4px 12px rgba(0,0,0,0.35)',
            background: 'linear-gradient(145deg, #f0e7d2, #c9b88a)',
          }}
        >
          <img
            src={memorial.image}
            alt={memorial.name}
            className="w-full h-full object-cover"
            style={{ filter: 'contrast(1.05) brightness(0.95) sepia(0.05)' }}
          />
        </div>

        {/* Name */}
        <div
          className="absolute left-0 right-0 text-center"
          style={{ top: config.name.top }}
        >
          {config.name.curve ? (
            <svg
              width="100%"
              viewBox="0 0 280 50"
              preserveAspectRatio="xMidYMid meet"
              style={{ overflow: 'visible' }}
            >
              <defs>
                <path id={`curve-${designId}`} d="M 20 40 Q 140 18 260 40" fill="none" stroke="none" />
              </defs>
              <text
                fontSize={nameFontSize}
                fontFamily={config.name.family || '"Cinzel Decorative", "Cinzel", "IM Fell English SC", Georgia, serif'}
                fontWeight="bold"
                fill={config.name.color}
                textAnchor="middle"
                style={{
                  letterSpacing: config.name.letterSpacing || '1px',
                  textShadow: config.name.shadow || ENGRAVED_DARK_SHADOW,
                }}
              >
                <textPath href={`#curve-${designId}`} startOffset="50%">
                  {nameText}
                </textPath>
              </text>
            </svg>
          ) : (
            <p
              className="font-bold"
              style={{
                fontFamily: config.name.family || '"Cinzel Decorative", "Cinzel", "IM Fell English SC", Georgia, serif',
                color: config.name.color,
                fontSize: `${nameFontSize}px`,
                letterSpacing: config.name.letterSpacing || '1px',
                textShadow: config.name.shadow || ENGRAVED_DARK_SHADOW,
                lineHeight: 1.1,
                margin: 0,
                padding: '0 4px',
                wordBreak: 'break-word',
              }}
            >
              {nameText}
            </p>
          )}
        </div>

        {/* Dates */}
        <div
          className="absolute left-0 right-0 text-center"
          style={{ top: config.dates.top }}
        >
          <p
            className="font-semibold"
            style={{
              fontFamily: config.dates.family || '"Cinzel Decorative", "Cinzel", "IM Fell English SC", Georgia, serif',
              color: config.dates.color,
              fontSize: `${dateFontSize}px`,
              letterSpacing: '0.5px',
              textShadow: config.dates.shadow || ENGRAVED_DARK_SHADOW,
              lineHeight: 1.1,
              margin: 0,
            }}
          >
            {headstoneYears}
          </p>
        </div>
      </div>
    </div>
  )
}

export default function HeadstoneMemorial({ memorial }: HeadstoneMemorialProps) {
  return (
    <div className="memorial-card rounded-xl p-8">
      <h2 className="text-xl font-semibold text-white mb-6 text-center">Memorial Headstone</h2>
      
      {/* Headstone Container */}
      <div className="flex items-start gap-8">
        
        <div className="relative z-10">
          <HeadstoneStone memorial={memorial} />
        </div>
        
        {/* Tribute Summary on the Right */}
        <div className="flex-1 max-w-sm">
          <div className="glass-effect rounded-xl p-6">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-5 h-5 text-accent-400">🎁</div>
              <h3 className="text-lg font-semibold text-white">Tribute Summary</h3>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-accent-400">Total Tributes:</span>
                <span className="text-white font-medium">{memorial.totalTributes}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-accent-400">Amount Raised:</span>
                <span className="text-white font-medium">{memorial.totalAmount} ETB</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Memorial Message */}
      <div className="text-center mt-6">
        <p className="text-accent-300 italic text-sm">
          "In loving memory of a life well lived and a legacy that will endure forever."
        </p>
      </div>
    </div>
  )
}


