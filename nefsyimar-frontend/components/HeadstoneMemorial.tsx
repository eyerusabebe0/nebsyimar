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
  // Intrinsic aspect ratio (image width / height). The render box is sized to
  // this so `object-contain` never letterboxes and the overlay maps 1:1 onto
  // the real stone face.
  ratio: number
  face: { top: string; left: string; width: string; height: string }
  transform?: string // CSS transform applied to the engraving overlay
  photo: {
    top: string
    widthPct: number
    aspect: number
    shape: 'oval' | 'circle' | 'heart' | 'rect'
    frame?: string // ring color around the photo
  }
  name: {
    top: string
    color: string
    baseFontSize: number // px when the engraving face is REF_FACE_WIDTH px wide
    curve?: boolean
    family?: string
    shadow?: string
    letterSpacing?: string
    maxChars: number
  }
  dates: {
    top: string
    color: string
    baseFontSize: number // px when the engraving face is REF_FACE_WIDTH px wide
    family?: string
    shadow?: string
  }
}

// Reference engraving-face width (px). Photo and fonts are scaled relative to
// the actual rendered face width so every stone — large or small — stays in
// proportion and the inscription always fits the panel.
const REF_FACE_WIDTH = 170

const ENGRAVED_DARK_SHADOW =
  '0 1px 0 rgba(255,255,255,0.18), 0 -1px 0 rgba(0,0,0,0.55), 1px 1px 2px rgba(0,0,0,0.6)'
const ENGRAVED_LIGHT_SHADOW =
  '0 1px 0 rgba(255,255,255,0.08), 0 -1px 0 rgba(0,0,0,0.35), 1px 1px 2px rgba(0,0,0,0.45)'
const ENGRAVED_GOLD_SHADOW =
  '0 1px 0 rgba(255,255,255,0.2), 0 0 6px rgba(212,168,83,0.35), 1px 1px 1px rgba(0,0,0,0.6)'

const SERIF = '"Cinzel Decorative", "Cinzel", "IM Fell English SC", Georgia, serif'

const STONE_CONFIGS: Record<string, StoneConfig> = {
  // Irregular brown rock, slightly leans (484x515)
  stone_1: {
    src: '/STONES/stone_1.png',
    ratio: 484 / 515,
    face: { top: '30%', left: '23%', width: '36%', height: '46%' },
    transform: 'rotate(-4deg) skewY(-1.5deg)',
    photo: { top: '0%', widthPct: 64, aspect: 1.2, shape: 'oval', frame: 'rgba(214,182,120,0.85)' },
    name: {
      top: '58%',
      color: '#f7eed8',
      baseFontSize: 19,
      curve: false,
      family: SERIF,
      shadow: ENGRAVED_GOLD_SHADOW,
      letterSpacing: '1px',
      maxChars: 15,
    },
    dates: {
      top: '83%',
      color: '#ecdcb4',
      baseFontSize: 14,
      family: SERIF,
      shadow: ENGRAVED_GOLD_SHADOW,
    },
  },
  // Classic grey granite arched (409x467)
  stone_2: {
    src: '/STONES/stone_2.png',
    ratio: 409 / 467,
    face: { top: '12%', left: '17%', width: '66%', height: '54%' },
    photo: { top: '2%', widthPct: 42, aspect: 1.22, shape: 'oval', frame: 'rgba(225,225,225,0.6)' },
    name: {
      top: '60%',
      color: '#f5f1e4',
      baseFontSize: 22,
      curve: true,
      family: SERIF,
      shadow: ENGRAVED_DARK_SHADOW,
      letterSpacing: '2px',
      maxChars: 18,
    },
    dates: {
      top: '86%',
      color: '#e9e2c8',
      baseFontSize: 15,
      family: SERIF,
      shadow: ENGRAVED_DARK_SHADOW,
    },
  },
  // Black granite arched with roses (418x464)
  stone_3: {
    src: '/STONES/stone_3.png',
    ratio: 418 / 464,
    face: { top: '9%', left: '16%', width: '68%', height: '52%' },
    photo: { top: '2%', widthPct: 40, aspect: 1.22, shape: 'oval', frame: 'rgba(212,168,83,0.75)' },
    name: {
      top: '60%',
      color: '#f6dd92',
      baseFontSize: 21,
      curve: true,
      family: SERIF,
      shadow: ENGRAVED_GOLD_SHADOW,
      letterSpacing: '2px',
      maxChars: 18,
    },
    dates: {
      top: '87%',
      color: '#ead082',
      baseFontSize: 15,
      family: SERIF,
      shadow: ENGRAVED_GOLD_SHADOW,
    },
  },
  // Cream marble ogee top, faces slightly left (265x364)
  stone_4: {
    src: '/STONES/stone_4.png',
    ratio: 265 / 364,
    face: { top: '8%', left: '11%', width: '62%', height: '58%' },
    transform: 'perspective(1100px) rotateY(6deg)',
    photo: { top: '2%', widthPct: 44, aspect: 1.22, shape: 'oval', frame: 'rgba(150,120,70,0.55)' },
    name: {
      top: '60%',
      color: '#3b2f1d',
      baseFontSize: 21,
      curve: true,
      family: SERIF,
      shadow: '0 1px 0 rgba(255,255,255,0.5), 1px 1px 2px rgba(0,0,0,0.35)',
      letterSpacing: '2px',
      maxChars: 18,
    },
    dates: {
      top: '87%',
      color: '#4a3a22',
      baseFontSize: 14,
      family: SERIF,
      shadow: '0 1px 0 rgba(255,255,255,0.4), 1px 1px 2px rgba(0,0,0,0.3)',
    },
  },
  // Tan 3D arch, faces right, small in wide frame (661x377)
  stone_5: {
    src: '/STONES/stone_5.png',
    ratio: 661 / 377,
    face: { top: '16%', left: '35%', width: '25%', height: '50%' },
    transform: 'perspective(900px) rotateY(-15deg) skewY(-1.5deg)',
    photo: { top: '0%', widthPct: 62, aspect: 1.2, shape: 'oval', frame: 'rgba(150,120,70,0.6)' },
    name: {
      top: '60%',
      color: '#3a2f1c',
      baseFontSize: 19,
      curve: false,
      family: SERIF,
      shadow: '0 1px 0 rgba(255,255,255,0.45), 1px 1px 2px rgba(0,0,0,0.4)',
      letterSpacing: '1px',
      maxChars: 14,
    },
    dates: {
      top: '85%',
      color: '#4a3a22',
      baseFontSize: 14,
      family: SERIF,
      shadow: '0 1px 0 rgba(255,255,255,0.4), 1px 1px 2px rgba(0,0,0,0.3)',
    },
  },
  // Ornate white marble cathedral arch, central panel (661x377)
  stone_6: {
    src: '/STONES/stone_6.png',
    ratio: 661 / 377,
    face: { top: '37%', left: '42%', width: '16%', height: '30%' },
    transform: 'perspective(900px) rotateY(-5deg)',
    photo: { top: '0%', widthPct: 76, aspect: 1.2, shape: 'oval', frame: 'rgba(150,120,70,0.5)' },
    name: {
      top: '66%',
      color: '#3a3024',
      baseFontSize: 20,
      family: SERIF,
      shadow: '0 1px 0 rgba(255,255,255,0.35), 1px 1px 1px rgba(0,0,0,0.3)',
      letterSpacing: '0.5px',
      maxChars: 12,
    },
    dates: {
      top: '88%',
      color: '#4a3a22',
      baseFontSize: 14,
      family: SERIF,
      shadow: '0 1px 0 rgba(255,255,255,0.3)',
    },
  },
  // Garden granite, smooth panel above floral band (500x500)
  stone_7: {
    src: '/STONES/stone_7.png',
    ratio: 1,
    face: { top: '16%', left: '34%', width: '32%', height: '38%' },
    photo: { top: '0%', widthPct: 60, aspect: 1.18, shape: 'oval', frame: 'rgba(120,120,120,0.5)' },
    name: {
      top: '62%',
      color: '#2c2c2c',
      baseFontSize: 19,
      family: SERIF,
      shadow: '0 1px 0 rgba(255,255,255,0.45), 1px 1px 1px rgba(0,0,0,0.3)',
      letterSpacing: '1px',
      maxChars: 13,
    },
    dates: {
      top: '85%',
      color: '#3a3a3a',
      baseFontSize: 14,
      family: SERIF,
      shadow: '0 1px 0 rgba(255,255,255,0.35)',
    },
  },
  // Black granite with carved cross + flowers (500x500)
  stone_8: {
    src: '/STONES/stone_8.png',
    ratio: 1,
    face: { top: '18%', left: '33%', width: '34%', height: '56%' },
    photo: { top: '0%', widthPct: 40, aspect: 1.2, shape: 'oval', frame: 'rgba(212,168,83,0.7)' },
    name: {
      top: '58%',
      color: '#f6dd92',
      baseFontSize: 18,
      curve: true,
      family: SERIF,
      shadow: ENGRAVED_GOLD_SHADOW,
      letterSpacing: '1px',
      maxChars: 16,
    },
    dates: {
      top: '83%',
      color: '#ead082',
      baseFontSize: 14,
      family: SERIF,
      shadow: ENGRAVED_GOLD_SHADOW,
    },
  },
  // Black granite heart with angel — photo fills the heart (585x427)
  stone_9: {
    src: '/STONES/stone_9.png',
    ratio: 585 / 427,
    face: { top: '32%', left: '42%', width: '32%', height: '50%' },
    photo: { top: '0%', widthPct: 80, aspect: 1.05, shape: 'heart' },
    name: {
      top: '74%',
      color: '#f6dd92',
      baseFontSize: 16,
      family: SERIF,
      shadow: ENGRAVED_GOLD_SHADOW,
      letterSpacing: '0.5px',
      maxChars: 14,
    },
    dates: {
      top: '90%',
      color: '#ead082',
      baseFontSize: 12,
      family: SERIF,
      shadow: ENGRAVED_GOLD_SHADOW,
    },
  },
  // Dark royal mausoleum, white central panel (661x377)
  stone_10: {
    src: '/STONES/stone_10.png',
    ratio: 661 / 377,
    face: { top: '38%', left: '40%', width: '15%', height: '29%' },
    transform: 'perspective(900px) rotateY(-8deg)',
    photo: { top: '0%', widthPct: 78, aspect: 1.18, shape: 'oval', frame: 'rgba(150,120,70,0.5)' },
    name: {
      top: '66%',
      color: '#3a3024',
      baseFontSize: 19,
      family: SERIF,
      shadow: '0 1px 0 rgba(255,255,255,0.4), 1px 1px 1px rgba(0,0,0,0.25)',
      letterSpacing: '0.5px',
      maxChars: 11,
    },
    dates: {
      top: '87%',
      color: '#4a3a22',
      baseFontSize: 13,
      family: SERIF,
      shadow: '0 1px 0 rgba(255,255,255,0.35)',
    },
  },
  // White marble dome shrine, central panel (661x377)
  stone_11: {
    src: '/STONES/stone_11.png',
    ratio: 661 / 377,
    face: { top: '47%', left: '37%', width: '14%', height: '25%' },
    transform: 'perspective(900px) rotateY(-8deg)',
    photo: { top: '0%', widthPct: 76, aspect: 1.18, shape: 'oval', frame: 'rgba(150,120,70,0.45)' },
    name: {
      top: '64%',
      color: '#3a3024',
      baseFontSize: 18,
      family: SERIF,
      shadow: '0 1px 0 rgba(255,255,255,0.45), 1px 1px 1px rgba(0,0,0,0.25)',
      letterSpacing: '0.5px',
      maxChars: 11,
    },
    dates: {
      top: '86%',
      color: '#4a3a22',
      baseFontSize: 13,
      family: SERIF,
      shadow: '0 1px 0 rgba(255,255,255,0.35)',
    },
  },
  // Black ornate dome shrine, central panel (612x408)
  stone_12: {
    src: '/STONES/stone_12.png',
    ratio: 612 / 408,
    face: { top: '47%', left: '48%', width: '15%', height: '27%' },
    transform: 'perspective(900px) rotateY(-6deg)',
    photo: { top: '0%', widthPct: 72, aspect: 1.18, shape: 'oval', frame: 'rgba(212,168,83,0.6)' },
    name: {
      top: '64%',
      color: '#f6dd92',
      baseFontSize: 18,
      family: SERIF,
      shadow: ENGRAVED_GOLD_SHADOW,
      letterSpacing: '0.5px',
      maxChars: 11,
    },
    dates: {
      top: '87%',
      color: '#ead082',
      baseFontSize: 13,
      family: SERIF,
      shadow: ENGRAVED_GOLD_SHADOW,
    },
  },
  // Black granite with sculpted bust + scroll banner (612x408)
  stone_13: {
    src: '/STONES/stone_13.png',
    ratio: 612 / 408,
    face: { top: '28%', left: '32%', width: '36%', height: '42%' },
    photo: { top: '30%', widthPct: 36, aspect: 1.1, shape: 'oval', frame: 'rgba(212,168,83,0.6)' },
    name: {
      top: '2%',
      color: '#1a1a1a',
      baseFontSize: 16,
      curve: true,
      family: SERIF,
      shadow: '0 1px 0 rgba(255,255,255,0.45)',
      letterSpacing: '1px',
      maxChars: 18,
    },
    dates: {
      top: '82%',
      color: '#f6dd92',
      baseFontSize: 14,
      family: SERIF,
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

  // Fit the render box to the stone's intrinsic aspect ratio inside the
  // (width × height) budget. This removes `object-contain` letterboxing so the
  // engraving overlay percentages map exactly onto the visible stone face.
  let boxW = width
  let boxH = width / config.ratio
  if (boxH > height) {
    boxH = height
    boxW = height * config.ratio
  }

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

  // The engraving face is a fraction of the rendered box. Scaling photo + fonts
  // off the face width (in px) keeps everything in proportion: a big stone gets
  // a big photo and big lettering, a small stone shrinks them to match.
  const parsePct = (v: string) => Math.max(0, Math.min(100, parseFloat(v) || 0))
  const faceWidthPx = boxW * (parsePct(config.face.width) / 100)
  const faceScale = faceWidthPx / REF_FACE_WIDTH

  // Auto-fit name to the face: shrink long names so they never overflow.
  const nameText = (memorial.name || '').trim()
  const safeNameLen = Math.max(1, nameText.length)
  const nameScale = Math.min(1, config.name.maxChars / safeNameLen)
  const nameFontSize = Math.max(7, config.name.baseFontSize * nameScale * faceScale)
  const dateFontSize = Math.max(6, config.dates.baseFontSize * faceScale)

  // Photo computed from face width
  const photoWidthFactor = config.photo.widthPct / 100

  // Constrain photo height so it never overflows the engraving panel
  // (between the photo top and where the name begins).
  const photoTopPct = parsePct(config.photo.top)
  const nameTopPct = parsePct(config.name.top)
  const availablePct = Math.max(20, nameTopPct - photoTopPct - 4) // leave ~4% gap
  const photoMaxHeight = `${availablePct}%`

  // Heart clip path (CSS clip-path heart shape)
  const heartClip =
    'path("M 50,80 C 20,55 5,40 5,25 C 5,10 20,5 30,5 C 40,5 47,12 50,22 C 53,12 60,5 70,5 C 80,5 95,10 95,25 C 95,40 80,55 50,80 Z")'

  const isHeart = config.photo.shape === 'heart'
  const photoShape =
    config.photo.shape === 'circle'
      ? '50%'
      : config.photo.shape === 'oval'
      ? '50% / 50%'
      : isHeart
      ? '0'
      : '8px'

  // Engraved photo frame: a tasteful ring + soft engraved depth, scaled to size.
  const frameColor = config.photo.frame || 'rgba(180,160,110,0.7)'
  const ringPx = Math.max(1.5, faceScale * 2.6)
  const curveFontSize = nameFontSize * 280 / Math.max(1, faceWidthPx)

  return (
    <div
      className={`relative ${className}`}
      style={{ width: `${boxW}px`, height: `${boxH}px` }}
    >
      <img
        src={config.src}
        alt="Headstone"
        className="w-full h-full object-fill drop-shadow-2xl select-none pointer-events-none"
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
            clipPath: isHeart ? heartClip : undefined,
            border: isHeart ? 'none' : `${ringPx}px solid ${frameColor}`,
            boxShadow: isHeart
              ? 'inset 0 0 14px rgba(0,0,0,0.55)'
              : `inset 0 2px 6px rgba(0,0,0,0.45), 0 4px 12px rgba(0,0,0,0.4), 0 0 0 1px rgba(0,0,0,0.25)`,
            background: 'linear-gradient(145deg, #f0e7d2, #c9b88a)',
          }}
        >
          <img
            src={memorial.image}
            alt={memorial.name}
            className="w-full h-full object-cover"
            style={{ filter: 'contrast(1.06) brightness(0.97) saturate(0.95) sepia(0.04)' }}
          />
          {/* Soft vignette + sheen for an engraved, museum-quality finish */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse at 50% 38%, rgba(255,255,255,0.12), rgba(0,0,0,0) 45%), radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.34) 100%)',
            }}
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
              viewBox="0 0 280 70"
              preserveAspectRatio="xMidYMid meet"
              style={{ overflow: 'visible' }}
            >
              <defs>
                <path id={`curve-${designId}`} d="M 20 50 Q 140 22 260 50" fill="none" stroke="none" />
              </defs>
              <text
                fontSize={curveFontSize}
                fontFamily={config.name.family || SERIF}
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
                fontFamily: config.name.family || SERIF,
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
              fontFamily: config.dates.family || SERIF,
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


