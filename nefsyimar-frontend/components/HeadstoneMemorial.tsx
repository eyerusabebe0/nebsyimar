'use client'

import React, { useState, useEffect } from 'react'

export type HeadstoneDesignId =
  | 'stone_1' | 'stone_2' | 'stone_3' | 'stone_4'
  | 'stone_6' | 'stone_7' | 'stone_8' | 'stone_9'

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
}

const STONE_LAYOUTS: Record<HeadstoneDesignId, LayoutConfig> = {
  stone_1: { photoShape: 'circle', photoTopPct: 9, photoSizePct: 28, photoLeftPct: 45, textPanelTopPct: 40, textWidthPct: 45, nameFontSize: 17, datesFontSize: 15, zoomScale: 1.05 },
  stone_2: { photoShape: 'circle', photoTopPct: 11, photoSizePct: 35, photoLeftPct: 50, textPanelTopPct: 48, textWidthPct: 45, nameFontSize: 17, datesFontSize: 15, zoomScale: 1.05 },
  stone_3: { photoShape: 'circle', photoTopPct: 12, photoSizePct: 35, photoLeftPct: 50, textPanelTopPct: 48, textWidthPct: 45, nameFontSize: 17, datesFontSize: 15, zoomScale: 1.05 },
  stone_4: { photoShape: 'circle', photoTopPct: 11, photoSizePct: 40, photoLeftPct: 52, textPanelTopPct: 52, textWidthPct: 45, nameFontSize: 17, datesFontSize: 15, zoomScale: 1.05 },
  stone_6: { photoShape: 'circle', photoTopPct: 13, photoSizePct: 35, photoLeftPct: 50, textPanelTopPct: 50, textWidthPct: 45, nameFontSize: 17, datesFontSize: 15, zoomScale: 1.05 },
  stone_7: { photoShape: 'circle', photoTopPct: 20, photoSizePct: 25, photoLeftPct: 53, textPanelTopPct: 47, textWidthPct: 45, nameFontSize: 12, datesFontSize: 10, zoomScale: 1.3 },
  stone_8: { photoShape: 'circle', photoTopPct: 11, photoSizePct: 40, photoLeftPct: 51, textPanelTopPct: 47, textWidthPct: 45, nameFontSize: 17, datesFontSize: 15, zoomScale: 1.05 },
  stone_9: { photoShape: 'circle', photoTopPct: 10, photoSizePct: 30, photoLeftPct: 46, textPanelTopPct: 40, textWidthPct: 45, nameFontSize: 15, datesFontSize: 15, zoomScale: 1.05 },
}

const STONE_META: Record<HeadstoneDesignId, { src: string }> = {
  stone_1: { src: '/STONES/stone_1.png' },
  stone_2: { src: '/STONES/stone_2.png' },
  stone_3: { src: '/STONES/stone_3.png' },
  stone_4: { src: '/STONES/stone_4.png' },
  stone_6: { src: '/STONES/stone_6.png' },
  stone_7: { src: '/STONES/stone_7.png' },
  stone_8: { src: '/STONES/stone_8.png' },
  stone_9: { src: '/STONES/stone_9.png' },
}

const LIGHT_FACE_STONES: HeadstoneDesignId[] = ['stone_2', 'stone_4', 'stone_6', 'stone_7', 'stone_8', 'stone_9']

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
}: {
  memorial?: HeadstoneStoneMemorial
  selectedDesignId?: HeadstoneDesignId
  className?: string
  width?: number
  height?: number
}) {
  const activeDesignId = (selectedDesignId || memorial?.headstoneDesign || 'stone_2') as HeadstoneDesignId
  const activeStone = STONE_META[activeDesignId] || STONE_META.stone_2
  const layout = STONE_LAYOUTS[activeDesignId] || STONE_LAYOUTS.stone_2
  const isLightFace = LIGHT_FACE_STONES.includes(activeDesignId)
const zoomScale = layout.zoomScale
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

  // FIX: Sharper, high-contrast shadows to ensure visibility on all stone colors
  const engravedTextShadow = isLightFace
    ? '0.5px 0.5px 0px rgba(0,0,0,0.4), -0.5px -0.5px 0px rgba(255,255,255,0.7)'
    : '0.5px 0.5px 0px rgba(0,0,0,0.9), -0.5px -0.5px 0px rgba(255,255,255,0.1)'

  // FIX: Brighter text colors to ensure readability on dark stones
  const textColor = isLightFace ? '#2a2a2a' : '#f0eada'

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
    transform: `scale(${layout.zoomScale})`,
    transformOrigin: 'center center' // Ensures it zooms from the middle
  }}
/>

        {/* Photo Container */}
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
          {memorial?.image && (
            <img
              src={memorial.image}
              className="w-full h-full object-cover"
              alt={name}
              // Added slight grayscale/contrast to help it blend with stone texture
              style={{ filter: 'contrast(1.05) brightness(0.9) grayscale(0.2)' }}
            />
          )}
          {/* Enhanced depth overlay */}
          <div className="absolute inset-0 bg-black/10 pointer-events-none" />
        </div>

        {/* Engraved name + dates */}
        <div
          className="absolute text-center font-serif font-bold px-1"
          style={{
            top: `${layout.textPanelTopPct}%`,
            left: '50%',
            transform: 'translateX(-50%)',
            width: `${layout.textWidthPct}%`,
            color: textColor,
            zIndex: 30,
          }}
        >
          <p
            className="uppercase leading-tight break-words whitespace-pre-wrap"
            style={{
              fontSize: `${layout.nameFontSize * scaleFactor * nameScale}px`,
              textShadow: engravedTextShadow,
            }}
          >
            {name}
          </p>
          <p
            className="mt-1 font-serif"
            style={{
              fontSize: `${layout.datesFontSize * scaleFactor * Math.max(nameScale, 0.8)}px`,
              textShadow: engravedTextShadow,
            }}
          >
            {memorial?.dates}
          </p>
        </div>
      </div>
    </div>
  )
}