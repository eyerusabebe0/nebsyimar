'use client'

import { useRef, useState } from 'react'
import { Flame, Move3D } from 'lucide-react'
import { HeadstonePreview, type HeadstoneStoneMemorial } from './HeadstoneMemorial'

interface Memorial3DSceneProps {
  memorial: HeadstoneStoneMemorial
}

export default function Memorial3DScene({ memorial }: Memorial3DSceneProps) {
  const sceneRef = useRef<HTMLDivElement | null>(null)
  const [hovering, setHovering] = useState(false)

  return (
    <div
      ref={sceneRef}
      onPointerEnter={() => setHovering(true)}
      onPointerLeave={() => setHovering(false)}
      className="relative w-full aspect-[4/5] sm:aspect-[4/3] md:aspect-auto md:h-[620px] rounded-3xl overflow-hidden border border-accent-500/30 select-none cursor-default"
      style={{
        background: 'radial-gradient(ellipse at top, #1a2238 0%, #0a0a16 65%, #050510 100%)',
      }}
    >
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-blue-900/40 via-black/20 to-transparent" />

      <div className="relative w-full h-full flex flex-col items-center justify-center p-4">
        <div className="relative z-30 scale-75 sm:scale-90 md:scale-100 transition-transform duration-500">
          <div className="animate-[stoneDrift_6s_ease-in-out_infinite_alternate]">
            <HeadstonePreview memorial={memorial} width={280} height={360} />
          </div>
          <div className="w-[240px] h-6 bg-[#272420] rounded-lg shadow-2xl -mt-4 mx-auto" />
        </div>
      </div>

      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end z-40">
        <div className="flex items-center gap-2 px-3 py-1 bg-black/40 backdrop-blur-md border border-accent-500/30 rounded-full text-[10px] sm:text-xs text-accent-200">
          <Flame className="w-3 h-3 text-accent-400" />
          <span className="hidden sm:inline">{hovering ? 'The candle flame flickers' : 'A light for remembrance'}</span>
        </div>

        <div className="px-3 py-1 bg-black/40 backdrop-blur-md border border-accent-500/30 rounded-full text-[10px] sm:text-xs uppercase tracking-widest text-accent-300 flex items-center gap-2">
          <Move3D className="w-3 h-3 text-accent-400" />
          <span className="hidden sm:inline">Resting Place</span>
        </div>
      </div>

      <style jsx>{`
        @keyframes stoneDrift {
          0% { transform: translateY(0px) rotateZ(-0.5deg); }
          100% { transform: translateY(-8px) rotateZ(0.5deg); }
        }
      `}</style>
    </div>
  )
}