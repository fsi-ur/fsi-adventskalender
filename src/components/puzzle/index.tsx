'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { cn } from '@/utilities/ui'
import { Button } from '@/components/ui/button'

// Grid configuration - 10x10 = 100 pieces
const GRID_COLS = 10
const GRID_ROWS = 10
const PIECE_SIZE = 40 // Size of each piece in pixels

type PuzzlePiece = {
  id: number
  row: number
  col: number
  rotation: number // 0, 90, 180, 270
}

// Generate puzzle with randomly rotated pieces
const generatePuzzle = (): PuzzlePiece[] => {
  const pieces: PuzzlePiece[] = []
  for (let row = 0; row < GRID_ROWS; row++) {
    for (let col = 0; col < GRID_COLS; col++) {
      // Random rotation (0, 90, 180, or 270 degrees)
      const randomRotation = Math.floor(Math.random() * 4) * 90
      pieces.push({
        id: row * GRID_COLS + col,
        row,
        col,
        rotation: randomRotation,
      })
    }
  }
  return pieces
}

// Image configuration
const PUZZLE_IMAGE = '/door-puzzle.jpg'

// Snowman reveal component
const SnowmanReveal = () => (
  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-sky-200 to-sky-100 dark:from-sky-900 dark:to-sky-800 rounded-lg overflow-hidden">
    <svg viewBox="0 0 200 200" width="200" height="200">
      {/* Sky with stars */}
      <rect width="200" height="200" fill="url(#skyGradient)" />
      <defs>
        <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1e3a5f" />
          <stop offset="100%" stopColor="#87CEEB" />
        </linearGradient>
      </defs>
      
      {/* Stars */}
      <g fill="#FFD700">
        <circle cx="30" cy="20" r="2" />
        <circle cx="170" cy="30" r="2" />
        <circle cx="80" cy="15" r="1.5" />
        <circle cx="150" cy="45" r="1.5" />
      </g>

      {/* Ground snow */}
      <ellipse cx="100" cy="190" rx="100" ry="20" fill="#F0F8FF" />
      
      {/* Snowman body */}
      <circle cx="100" cy="155" r="35" fill="white" stroke="#E8E8E8" strokeWidth="2" />
      <circle cx="100" cy="100" r="28" fill="white" stroke="#E8E8E8" strokeWidth="2" />
      <circle cx="100" cy="55" r="22" fill="white" stroke="#E8E8E8" strokeWidth="2" />
      
      {/* Hat */}
      <rect x="80" y="25" width="40" height="25" fill="#2D2D2D" rx="2" />
      <rect x="70" y="48" width="60" height="8" fill="#2D2D2D" rx="2" />
      <rect x="85" y="30" width="30" height="5" fill="#DC143C" />
      
      {/* Face */}
      <circle cx="92" cy="50" r="3" fill="#2D2D2D" />
      <circle cx="108" cy="50" r="3" fill="#2D2D2D" />
      <path d="M100 55 L108 62 L100 60 Z" fill="#FF6600" />
      
      {/* Smile */}
      <g fill="#2D2D2D">
        <circle cx="88" cy="68" r="1.5" />
        <circle cx="94" cy="71" r="1.5" />
        <circle cx="100" cy="72" r="1.5" />
        <circle cx="106" cy="71" r="1.5" />
        <circle cx="112" cy="68" r="1.5" />
      </g>
      
      {/* Scarf */}
      <path d="M75 78 Q100 85 125 78" stroke="#DC143C" strokeWidth="8" fill="none" />
      <rect x="115" y="78" width="8" height="25" fill="#DC143C" rx="2" />
      <rect x="108" y="95" width="8" height="20" fill="#DC143C" rx="2" />
      
      {/* Buttons */}
      <circle cx="100" cy="100" r="4" fill="#2D2D2D" />
      <circle cx="100" cy="120" r="4" fill="#2D2D2D" />
      <circle cx="100" cy="140" r="4" fill="#2D2D2D" />
      
      {/* Arms (sticks) */}
      <line x1="65" y1="105" x2="35" y2="85" stroke="#8B4513" strokeWidth="4" strokeLinecap="round" />
      <line x1="35" y1="85" x2="25" y2="80" stroke="#8B4513" strokeWidth="3" strokeLinecap="round" />
      <line x1="35" y1="85" x2="30" y2="75" stroke="#8B4513" strokeWidth="3" strokeLinecap="round" />
      
      <line x1="135" y1="105" x2="165" y2="85" stroke="#8B4513" strokeWidth="4" strokeLinecap="round" />
      <line x1="165" y1="85" x2="175" y2="80" stroke="#8B4513" strokeWidth="3" strokeLinecap="round" />
      <line x1="165" y1="85" x2="170" y2="75" stroke="#8B4513" strokeWidth="3" strokeLinecap="round" />
    </svg>
    <div className="mt-4 text-center">
      <div className="text-2xl font-bold text-green-700 dark:text-green-400">
        🎄 Frohe Weihnachten! 🎄
      </div>
      <div className="text-lg text-muted-foreground mt-2">
        Die Tür ist offen!
      </div>
    </div>
  </div>
)

type PuzzleProps = {
  className?: string
}

export const DoorPuzzle: React.FC<PuzzleProps> = ({ className = '' }) => {
  const [pieces, setPieces] = useState<PuzzlePiece[]>(() => generatePuzzle())
  const [selectedPieceId, setSelectedPieceId] = useState<number | null>(null)
  const [isComplete, setIsComplete] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)
  const [doorOpening, setDoorOpening] = useState(false)
  const [showSnowman, setShowSnowman] = useState(false)

  // Check if puzzle is complete
  useEffect(() => {
    const allCorrect = pieces.every((piece) => piece.rotation === 0)

    if (allCorrect && !isComplete) {
      setIsComplete(true)
      setShowCelebration(true)
      setTimeout(() => setDoorOpening(true), 800)
      setTimeout(() => setShowSnowman(true), 2000)
      setTimeout(() => setShowCelebration(false), 5000)
    }
  }, [pieces, isComplete])

  // Rotate a piece by clicking on it
  const handlePieceClick = useCallback(
    (pieceId: number) => {
      if (isComplete) return
      
      setSelectedPieceId(pieceId)
      setPieces((prev) =>
        prev.map((piece) => {
          if (piece.id !== pieceId) return piece
          const newRotation = (piece.rotation + 90) % 360
          return { ...piece, rotation: newRotation }
        })
      )
    },
    [isComplete]
  )

  // Reset puzzle
  const handleReset = useCallback(() => {
    setPieces(generatePuzzle())
    setSelectedPieceId(null)
    setIsComplete(false)
    setDoorOpening(false)
    setShowSnowman(false)
  }, [])

  // Count correct pieces
  const correctCount = pieces.filter((p) => p.rotation === 0).length

  return (
    <div className={cn('flex flex-col items-center gap-6', className)}>
      <style>{`
        @keyframes door-open {
          0% { transform: perspective(1000px) rotateY(0deg); }
          100% { transform: perspective(1000px) rotateY(-85deg); }
        }
        .door-opening {
          animation: door-open 1.5s ease-out forwards;
          transform-origin: left center;
        }
      `}</style>

      {/* Header */}
      <div className="text-center">
        <div className="text-2xl sm:text-3xl mb-2">
          🚪 Weihnachts-Türpuzzle 🎄
        </div>
        <div className="text-sm text-muted-foreground">
          Klicke auf die Teile um sie zu drehen, bis das Bild richtig ist!
        </div>
      </div>

      {/* Celebration overlay */}
      {showCelebration && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className="text-6xl animate-bounce">🎉🎄🎅🎁🎉</div>
        </div>
      )}

      {/* Main puzzle container */}
      <div 
        className="relative border-4 border-green-700 dark:border-green-500 rounded-lg shadow-2xl overflow-hidden bg-amber-900"
        style={{ 
          width: GRID_COLS * PIECE_SIZE + 8,
          height: GRID_ROWS * PIECE_SIZE + 8,
        }}
      >
        {/* The door puzzle */}
        <div 
          className={cn('relative', doorOpening && 'door-opening')}
          style={{ 
            width: GRID_COLS * PIECE_SIZE,
            height: GRID_ROWS * PIECE_SIZE,
          }}
        >
          {/* Hidden complete image for reference */}
          <div className="absolute inset-0 pointer-events-none opacity-0">
            <img src={PUZZLE_IMAGE} alt="Completed Puzzle" className="w-full h-full object-cover" />
          </div>

          {/* Puzzle pieces grid */}
          <div 
            className="grid"
            style={{
              gridTemplateColumns: `repeat(${GRID_COLS}, ${PIECE_SIZE}px)`,
              gridTemplateRows: `repeat(${GRID_ROWS}, ${PIECE_SIZE}px)`,
            }}
          >
            {pieces
              .sort((a, b) => a.id - b.id)
              .map((piece) => (
                <div
                  key={piece.id}
                  className={cn(
                    'cursor-pointer overflow-hidden relative',
                    'border border-gray-600/30',
                    'hover:border-yellow-400 hover:z-10',
                    selectedPieceId === piece.id && 'ring-2 ring-yellow-400 z-20',
                    piece.rotation === 0 && 'border-green-400/50',
                  )}
                  style={{
                    width: PIECE_SIZE,
                    height: PIECE_SIZE,
                  }}
                  onClick={() => handlePieceClick(piece.id)}
                >
                  {/* Each piece shows a portion of the door image, rotated */}
                  <div
                    style={{
                      width: PIECE_SIZE,
                      height: PIECE_SIZE,
                      transform: `rotate(${piece.rotation}deg)`,
                      transformOrigin: 'center center',
                      transition: 'transform 0.2s ease-out',
                      backgroundImage: `url(${PUZZLE_IMAGE})`,
                      backgroundSize: `${GRID_COLS * PIECE_SIZE}px ${GRID_ROWS * PIECE_SIZE}px`,
                      backgroundPosition: `-${piece.col * PIECE_SIZE}px -${piece.row * PIECE_SIZE}px`,
                    }}
                  />
                </div>
              ))}
          </div>
        </div>

        {/* Snowman reveal */}
        {showSnowman && <SnowmanReveal />}
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-3 w-full max-w-md px-4 sm:px-0">
        <div className="flex justify-center">
          <Button
            onClick={handleReset}
            variant="outline"
            size="sm"
            className="text-red-500 border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            🔄 Neu starten
          </Button>
        </div>

        {/* Progress */}
        <div className="text-sm text-center text-muted-foreground space-y-2 bg-card p-4 rounded-lg border border-border">
          <p className="font-medium">
            Klicke auf ein Teil um es um 90° zu drehen
          </p>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-green-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${(correctCount / pieces.length) * 100}%` }}
            />
          </div>
          <p className="text-green-600 dark:text-green-400 font-semibold">
            {correctCount} / {pieces.length} Teile richtig
          </p>
          {isComplete && (
            <p className="text-xl animate-pulse">🎉 Geschafft! 🎉</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default DoorPuzzle
