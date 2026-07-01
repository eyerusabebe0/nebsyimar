'use client'

import React, { useState, useEffect } from 'react'
import { User } from 'lucide-react'

export type HeadstoneDesignId =
  | 'stone_1' | 'stone_2' | 'stone_3' | 'stone_4'
  | 'stone_6' | 'stone_8' | 'stone_9' | 'stone_10'

export interface HeadstoneStoneMemorial {
  name?: string
  dates?: string
  image?: string
  headstoneDesign?: HeadstoneDesignId
}

type PhotoShape = 'circle' | 'rect'

type LayoutConfig = {
  photoShape: PhotoShape
  photoTopPct: number
  photoSizePct: number
  photoHeightPct?: number
  photoLeftPct: number
  textPanelTopPct: number
  textWidthPct: number
  nameFontSize: number
  datesFontSize: number
  zoomScale: number
  textAlign?: 'left' | 'center' | 'right'
}

// photoLeftPct/textPanel left are both anchored with translateX(-50%),
// so true center is 50. Where the stone artwork's carved circle isn't
// dead-center, we nudge slightly — kept as close to 50 as the art allows.
const STONE_LAYOUTS: Record<HeadstoneDesignId, LayoutConfig> = {
  stone_1: { photoShape: 'circle', photoTopPct: 9, photoSizePct: 28, photoLeftPct: 45, textPanelTopPct: 40, textWidthPct: 45, nameFontSize: 17, datesFontSize: 15, zoomScale: 1.05, textAlign: 'center' },
  stone_2: { photoShape: 'circle', photoTopPct: 11, photoSizePct: 35, photoLeftPct: 50, textPanelTopPct: 48, textWidthPct: 45, nameFontSize: 17, datesFontSize: 15, zoomScale: 1.05, textAlign: 'center' },
  stone_3: { photoShape: 'circle', photoTopPct: 12, photoSizePct: 35, photoLeftPct: 50, textPanelTopPct: 48, textWidthPct: 45, nameFontSize: 17, datesFontSize: 15, zoomScale: 1.05, textAlign: 'center' },
  stone_4: { photoShape: 'circle', photoTopPct: 11, photoSizePct: 40, photoLeftPct: 51, textPanelTopPct: 50, textWidthPct: 45, nameFontSize: 17, datesFontSize: 15, zoomScale: 1.05, textAlign: 'center' },
  stone_6: { photoShape: 'circle', photoTopPct: 13, photoSizePct: 36, photoLeftPct: 50, textPanelTopPct: 50, textWidthPct: 45, nameFontSize: 17, datesFontSize: 15, zoomScale: 1.05, textAlign: 'center' },
  stone_8: { photoShape: 'circle', photoTopPct: 29, photoSizePct: 25, photoLeftPct: 53, textPanelTopPct: 50, textWidthPct: 45, nameFontSize: 15, datesFontSize: 13, zoomScale: 1.2, textAlign: 'center' },
  stone_9: { photoShape: 'circle', photoTopPct: 10, photoSizePct: 30, photoLeftPct: 46, textPanelTopPct: 40, textWidthPct: 45, nameFontSize: 15, datesFontSize: 15, zoomScale: 1.05, textAlign: 'center' },
  stone_10: { photoShape: 'circle', photoTopPct: 22, photoSizePct: 20, photoLeftPct: 58, textPanelTopPct: 43, textWidthPct: 46, nameFontSize: 16, datesFontSize: 14, zoomScale: 2.7, textAlign: 'right' },
}

const STONE_META: Record<HeadstoneDesignId, { src: string }> = {
  stone_1: { src: '/STONES/stone_1.png' },
  stone_2: { src: '/STONES/stone_2.png' },
  stone_3: { src: '/STONES/stone_3.png' },
  stone_4: { src: '/STONES/stone_4.png' },
  stone_6: { src: '/STONES/stone_6.png' },
  stone_8: { src: '/STONES/stone_8.png' },
  stone_9: { src: '/STONES/stone_9.png' },
  stone_10: { src: '/STONES/stone_10.png' },
}

const LIGHT_FACE_STONES: HeadstoneDesignId[] = ['stone_2', 'stone_4', 'stone_6', 'stone_8', 'stone_9', 'stone_10']

const REFERENCE_WIDTH = 320

function getNameScale(name: string) {
  const len = name?.length || 0
  if (len <= 10) return 1
  const scale = 10 / len
  return Math.max(0.55, scale ** 0.55)
}

export function HeadstonePreview({
  memorial,
  selectedDesignId,
  className = '',
  width,
  height,
  zoomScaleOverride,
}: {
  memorial?: HeadstoneStoneMemorial
  selectedDesignId?: HeadstoneDesignId
  className?: string
  width?: number
  height?: number
  zoomScaleOverride?: number
}) {
  const activeDesignId = (selectedDesignId || memorial?.headstoneDesign || 'stone_2') as HeadstoneDesignId
  const activeStone = STONE_META[activeDesignId] || STONE_META.stone_2
  const layout = STONE_LAYOUTS[activeDesignId] || STONE_LAYOUTS.stone_2
  const isLightFace = LIGHT_FACE_STONES.includes(activeDesignId)
  const zoomScale = zoomScaleOverride ?? layout.zoomScale
  const [autoSize, setAutoSize] = useState({ width: 320, height: 384 })

  useEffect(() => {
    if (width && height) return
    const computeSize = () => {
      const vw = window.innerWidth
      if (vw < 768) {
        const w = Math.min(Math.max(vw * 0.62, 220), 300)
        setAutoSize({ width: w, height: w * 1.2 })
      } else {
        setAutoSize({ width: 320, height: 384 })
      }
    }
    computeSize()
    window.addEventListener('resize', computeSize)
    return () => window.removeEventListener('resize', computeSize)
  }, [width, height])

  const finalWidth = width || autoSize.width
  const finalHeight = height || autoSize.height
  const scaleFactor = finalWidth / REFERENCE_WIDTH

  const name = memorial?.name || 'In Loving Memory'
  const nameScale = getNameScale(name)

  // ── Carved-letter look ───────────────────────────────────────────
  // Instead of a flat, solid-colored label sitting on top of the stone,
  // the text uses a translucent ink so the stone's own texture still
  // shows through, plus a tight double shadow (dark groove + light
  // catch) to read as cut into the surface rather than printed on it.
  const isStone10 = activeDesignId === 'stone_10'
  const textColor = isStone10
    ? 'rgba(255, 255, 255, 0.98)'
    : isLightFace
      ? 'rgba(32, 30, 26, 0.82)'
      : 'rgba(228, 220, 196, 0.92)'
  const textBlendMode: React.CSSProperties['mixBlendMode'] = isStone10 ? 'normal' : isLightFace ? 'multiply' : 'normal'
  const textStroke = isStone10 ? '0.35px rgba(0, 0, 0, 0.6)' : undefined

  const engravedTextShadow = isStone10
    ? '0 0 10px rgba(0,0,0,0.65), 0 1px 2px rgba(0,0,0,0.75), 0 0 2px rgba(255,255,255,0.18)'
    : isLightFace
      ? '0.6px 0.6px 0px rgba(255,255,255,0.55), -0.6px -0.6px 0.6px rgba(0,0,0,0.45), 0 1px 1px rgba(0,0,0,0.15)'
      : '-0.6px -0.6px 0.6px rgba(0,0,0,0.85), 0.6px 0.6px 0px rgba(255,255,255,0.10), 0 0 2px rgba(0,0,0,0.4)'

  const photoHeightPct = layout.photoHeightPct ?? layout.photoSizePct
  const isRect = layout.photoShape === 'rect'

  // FIX: Added a strong border and refined inset shadows to eliminate "floating"
  const embeddedPhotoBoxShadow = 'inset 0 6px 12px rgba(0,0,0,0.8), 0 1px 0 rgba(255,255,255,0.1)'

  return (
    <div
      className={`relative flex items-center justify-center bg-transparent ${className}`}
      style={{ width: finalWidth, height: finalHeight }}
    >
      <div
        className="relative z-20 flex flex-col items-center bg-transparent"
        style={{ width: '100%', height: '100%', paddingTop: finalHeight * 0.10 }}
      >

        <img
          src={activeStone.src}
          alt="Headstone"
          className="h-full w-full object-contain"
          style={{
            transform: `scale(${zoomScale})`,
            transformOrigin: 'center center' // Ensures it zooms from the middle
          }}
        />

        {/* Photo Container — anchored to true center (50%) unless the
            stone artwork's carved circle requires a slight nudge */}
        <div
          className={`absolute overflow-hidden ${isRect ? 'rounded-sm' : 'rounded-full'}`}
          style={{
            top: `${layout.photoTopPct}%`,
            left: `${layout.photoLeftPct}%`,
            transform: 'translateX(-50%)',
            width: `${layout.photoSizePct}%`,
            height: isRect ? `${photoHeightPct}%` : undefined,
            aspectRatio: isRect ? undefined : '1/1',
            boxShadow: embeddedPhotoBoxShadow,
            border: '2px solid rgba(0,0,0,0.2)', // Added border to "set" the photo in the stone
            zIndex: 30,
          }}
        >
          {memorial?.image ? (
            <img
              src={memorial.image}
              className="w-full h-full object-cover"
              alt={name}
              // Added slight grayscale/contrast to help it blend with stone texture
              style={{ filter: 'contrast(1.05) brightness(0.9) grayscale(0.2)' }}
            />
          ) : (
            <div
              className="relative flex h-full w-full items-center justify-center"
              style={{
                background: 'transparent',
              }}
            >
              <User
                className="h-10 w-10"
                style={{
                  color: isLightFace ? 'rgba(45,40,30,0.85)' : 'rgba(215,200,170,0.8)',
                  filter: isLightFace
                    ? 'drop-shadow(1px 1px 0px rgba(255,255,255,0.5)) drop-shadow(-1px -1px 0px rgba(0,0,0,0.35))'
                    : 'drop-shadow(-1px -1px 0px rgba(0,0,0,0.7)) drop-shadow(1px 1px 0px rgba(255,255,255,0.12))',
                }}
                strokeWidth={2}
              />
              <span className="sr-only">No memorial photo</span>
            </div>
          )}
          {/* Carved ring border — double inset shadow mimics chiseled groove */}
          <div className="absolute inset-0 pointer-events-none" style={{
            boxShadow: isLightFace
              ? 'inset 0 3px 8px rgba(0,0,0,0.45), inset 0 -2px 4px rgba(255,255,255,0.25), inset 0 0 0 3px rgba(0,0,0,0.12), inset 0 0 0 4px rgba(255,255,255,0.15)'
              : 'inset 0 3px 10px rgba(0,0,0,0.7), inset 0 -2px 4px rgba(255,255,255,0.06), inset 0 0 0 3px rgba(0,0,0,0.3), inset 0 0 0 4px rgba(255,255,255,0.05)',
            borderRadius: 'inherit',
          }} />
        </div>

        {/* Engraved name + dates — perfectly centered box, carved text effect */}
        <div
          className="absolute text-center font-serif font-bold px-1"
          style={{
            top: `${layout.textPanelTopPct}%`,
            left: '50%',
            transform: 'translateX(-50%)',
            width: `${layout.textWidthPct}%`,
            color: textColor,
            mixBlendMode: textBlendMode,
            zIndex: 30,
          }}
        >
          <p
            className="uppercase leading-tight break-words whitespace-pre-wrap"
            style={{
              fontSize: `${layout.nameFontSize * scaleFactor * nameScale}px`,
              textShadow: engravedTextShadow,
              textAlign: layout.textAlign ?? 'center',
              letterSpacing: '0.4px',
              WebkitTextStroke: textStroke,
            }}
          >
            {name}
          </p>
          <p
            className="mt-1 font-serif"
            style={{
              fontSize: `${layout.datesFontSize * scaleFactor * Math.max(nameScale, 0.8)}px`,
              textShadow: engravedTextShadow,
              textAlign: layout.textAlign ?? 'center',
              letterSpacing: '0.3px',
              WebkitTextStroke: textStroke,
            }}
          >
            {memorial?.dates}
          </p>
        </div>
      </div>
    </div>
  )
}