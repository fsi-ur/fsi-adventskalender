'use client'

import React, { useState, useCallback, useMemo, useEffect, MouseEvent } from 'react'
import { cn } from '@/utilities/ui'
import { Button } from '@/components/ui/button'

type PuzzlePiece = {
  id: number
  row: number
  col: number
  rotation: number // 0, 90, 180, 270
  isCorrect: boolean
}

// Door configuration - we'll use a 10x10 grid for 100 pieces
const GRID_SIZE = 10

// Generate door puzzle pieces
const generateDoorPuzzle = (): PuzzlePiece[] => {
  const pieces: PuzzlePiece[] = []
  for (let i = 0; i < GRID_SIZE; i++) {
    for (let j = 0; j < GRID_SIZE; j++) {
      pieces.push({
        id: i * GRID_SIZE + j,
        row: i,
        col: j,
        rotation: Math.floor(Math.random() * 4) * 90,
        isCorrect: false,
      })
    }
  }
  // Shuffle pieces
  return pieces.sort(() => Math.random() - 0.5)
}

// Door color patterns - creates a nice old cottage door look
const getDoorPattern = (row: number, col: number): string => {
  const centerCol = GRID_SIZE / 2

  // Door frame (dark wood border)
  if (row === 0 || row === GRID_SIZE - 1 || col === 0 || col === GRID_SIZE - 1) {
    return 'from-amber-900 to-amber-950 text-amber-950'
  }

  // Door panels - create a classic 6-panel look
  const panelRow = Math.floor((row - 1) / 3)
  const panelCol = Math.floor((col - 1) / 3)

  if (panelRow === 0 && panelCol === 1) {
    // Upper middle panel
    return 'from-amber-700 to-amber-800 text-amber-900'
  } else if (panelRow === 1 && panelCol === 1) {
    // Middle panel
    return 'from-amber-600 to-amber-700 text-amber-800'
  } else if (panelRow === 2 && panelCol === 1) {
    // Lower middle panel
    return 'from-amber-700 to-amber-800 text-amber-900'
  } else if (col === centerCol) {
    // Vertical divider
    return 'from-amber-900 to-amber-950 text-amber-950'
  }

  // Panel sides with wood grain effect
  const hasWoodGrain = (row + col) % 3 === 0
  if (hasWoodGrain) {
    return 'from-amber-600 to-amber-700 text-amber-800'
  }

  return 'from-amber-700 to-amber-800 text-amber-900'
}

type PuzzleProps = {
  className?: string
}

export const DoorPuzzle: React.FC<PuzzleProps> = ({ className = '' }) => {
  const [pieces, setPieces] = useState<PuzzlePiece[]>(generateDoorPuzzle)
  const [selectedPieceId, setSelectedPieceId] = useState<number | null>(null)
  const [isComplete, setIsComplete] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)
  const [doorOpening, setDoorOpening] = useState(false)
  const [showSnowman, setShowSnowman] = useState(false)

  // Piece map for quick lookup (reserved for future use)
  useMemo(() => {
    const map: Record<number, PuzzlePiece> = {}
    pieces.forEach((piece: PuzzlePiece) => {
      map[piece.id] = piece
    })
    return map
  }, [pieces])

  // Check if puzzle is complete
  useEffect(() => {
    if (pieces.length === 0) return

    const allCorrect = pieces.every((piece: PuzzlePiece) => {
      const correctRotation = 0
      return piece.rotation === correctRotation
    })

    if (allCorrect && !isComplete) {
      setIsComplete(true)
      setShowCelebration(true)

      // Trigger door opening
      setTimeout(() => {
        setDoorOpening(true)
      }, 800)

      // Reveal snowman
      setTimeout(() => {
        setShowSnowman(true)
      }, 2000)

      setTimeout(() => setShowCelebration(false), 5000)
    }
  }, [pieces, isComplete])

  // Rotate selected piece
  const rotatePiece = useCallback(
    (pieceId: number, clockwise: boolean = true) => {
      setPieces((prev: PuzzlePiece[]) =>
        prev.map((piece: PuzzlePiece) => {
          if (piece.id !== pieceId) return piece
          const newRotation = clockwise
            ? (piece.rotation + 90) % 360
            : (piece.rotation - 90 + 360) % 360
          return { ...piece, rotation: newRotation }
        })
      )
    },
    []
  )

  // Handle piece click
  const handlePieceClick = useCallback(
    (pieceId: number, event: MouseEvent<HTMLDivElement>) => {
      setSelectedPieceId(pieceId)
      event.stopPropagation()
    },
    []
  )

  // Handle keyboard rotation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedPieceId && selectedPieceId !== 0) return
      if (isComplete) return

      switch (e.key) {
        case 'ArrowRight':
          rotatePiece(selectedPieceId, true)
          e.preventDefault()
          break
        case 'ArrowLeft':
          rotatePiece(selectedPieceId, false)
          e.preventDefault()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedPieceId, rotatePiece, isComplete])

  // Reset puzzle
  const handleReset = useCallback(() => {
    setPieces(generateDoorPuzzle())
    setSelectedPieceId(null)
    setIsComplete(false)
    setDoorOpening(false)
    setShowSnowman(false)
  }, [])

  // Puzzle pieces grid view
  const renderPuzzleGrid = () => {
    const grid: (PuzzlePiece | null)[][] = Array(GRID_SIZE)
      .fill(null)
      .map(() => Array(GRID_SIZE).fill(null))

    pieces.forEach((piece: PuzzlePiece) => {
      grid[piece.row][piece.col] = piece
    })

    return (
      <div className="grid gap-0 border-4 border-green-700 dark:border-green-500 rounded-lg overflow-hidden bg-black shadow-2xl">
        <style>{`
          .puzzle-grid {
            display: grid;
            grid-template-columns: repeat(${GRID_SIZE}, minmax(0, 1fr));
            gap: 0;
          }
        `}</style>
        <div className="puzzle-grid">
          {grid.map((row, rowIdx) =>
            row.map((piece, colIdx) => {
              const patternClass = getDoorPattern(rowIdx, colIdx)

              return (
                <div
                  key={`${rowIdx}-${colIdx}`}
                  className={cn(
                    'aspect-square flex items-center justify-center',
                    'border border-gray-800',
                    'text-xs font-bold',
                    'cursor-pointer transition-all duration-150',
                    'relative overflow-hidden',
                    `bg-gradient-to-br ${patternClass}`,
                  )}
                  onClick={(e: React.MouseEvent<HTMLDivElement>) => piece && handlePieceClick(piece.id, e)}
                >
                  {piece && (
                    <div
                      className={cn(
                        'absolute inset-0 flex items-center justify-center',
                        'font-bold text-sm select-none pointer-events-none',
                        selectedPieceId === piece.id && 'ring-2 ring-yellow-400',
                        piece.rotation !== 0 && 'animate-spin-slow'
                      )}
                      style={{
                        transform: `rotate(${piece.rotation}deg)`,
                        opacity: 0.3,
                      }}
                    >
                      ↻
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col items-center gap-6', className)}>
      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
        @keyframes door-open {
          0% { transform: perspective(1000px) rotateY(0deg); }
          100% { transform: perspective(1000px) rotateY(90deg); }
        }
        .door-opening {
          animation: door-open 1.5s ease-out forwards;
          transform-origin: right center;
        }
        @keyframes snowman-appear {
          0% {
            opacity: 0;
            transform: scale(0.8) translateY(20px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .snowman-appear {
          animation: snowman-appear 1s ease-out forwards;
        }
      `}</style>

      {/* Header */}
      <div className="text-center">
        <div className="text-2xl sm:text-3xl mb-2">
          🚪 Türpuzzle 🎄
        </div>
        <div className="text-sm text-muted-foreground">
          Drehe alle Puzzleteile so, dass die Tür perfekt wird
        </div>
      </div>

      {/* Celebration overlay */}
      {showCelebration && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className="text-6xl animate-bounce">🎉🎄🎅🎁🎉</div>
        </div>
      )}

      {/* Main puzzle container */}
      <div className="relative w-full max-w-2xl">
        <div className={cn(doorOpening && 'door-opening')} style={{ perspective: '1000px' }}>
          {renderPuzzleGrid()}
        </div>

        {/* Snowman reveal */}
        {showSnowman && (
          <div className={cn(
            'absolute inset-0 flex flex-col items-center justify-center',
            'snowman-appear bg-gradient-to-b from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-950',
            'rounded-lg border-4 border-green-700 dark:border-green-500'
          )}>
            <div className="text-center space-y-4">
              <div className="text-6xl">⛄</div>
              <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                Frohe Weihnachten!
              </div>
              <div className="text-lg text-muted-foreground">
                Die Tür ist offen! 🎅
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-3 w-full max-w-2xl px-4 sm:px-0">
        <div className="flex flex-wrap justify-center gap-2">
          <Button
            onClick={() => selectedPieceId !== null && rotatePiece(selectedPieceId, true)}
            disabled={selectedPieceId === null || isComplete}
            variant="outline"
            size="sm"
          >
            ↻ Links drehen
          </Button>

          <Button
            onClick={() => selectedPieceId !== null && rotatePiece(selectedPieceId, false)}
            disabled={selectedPieceId === null || isComplete}
            variant="outline"
            size="sm"
          >
            ↺ Rechts drehen
          </Button>

          <Button
            onClick={handleReset}
            variant="outline"
            size="sm"
            className="text-red-500 border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            🔄 Neustart
          </Button>
        </div>

        {/* Instructions */}
        <div className="text-xs sm:text-sm text-center text-muted-foreground space-y-1 bg-card p-3 rounded-lg border border-border">
          <p>
            {selectedPieceId !== null
              ? `📍 Teil ${selectedPieceId + 1} ausgewählt`
              : '👉 Klicke auf ein Puzzleteil um es auszuwählen'}
          </p>
          <p className="text-[11px] sm:text-xs">
            Nutze die Tasten oder Buttons um Teile zu drehen. Alle Teile müssen gerade sein!
          </p>
          <p className="text-green-600 dark:text-green-400 font-semibold">
            {pieces.filter((p: PuzzlePiece) => p.rotation === 0).length} / {pieces.length} Teile korrekt
          </p>
        </div>
      </div>
    </div>
  )
}

export default DoorPuzzle
