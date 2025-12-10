'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { cn } from '@/utilities/ui'

// Christmas-themed Tetris component with modern styling
// Controls: ← → for movement, ↓ for soft drop, ↑/Z/X for rotation, Space for hard drop

type CellData = { id: number; colorIdx: number; isGhost?: boolean; isCurrent?: boolean } | null

const WIDTH = 10
const HEIGHT = 20
const TICK_MS = 500

// Standard Tetromino shapes using SRS (Super Rotation System) coordinates
const SHAPES: Record<string, [number, number][]> = {
  I: [[0, 1], [1, 1], [2, 1], [3, 1]],
  O: [[1, 0], [2, 0], [1, 1], [2, 1]],
  T: [[1, 0], [0, 1], [1, 1], [2, 1]],
  L: [[2, 0], [0, 1], [1, 1], [2, 1]],
  J: [[0, 0], [0, 1], [1, 1], [2, 1]],
  S: [[1, 0], [2, 0], [0, 1], [1, 1]],
  Z: [[0, 0], [1, 0], [1, 1], [2, 1]],
}

const SHAPE_KEYS = Object.keys(SHAPES)

// Christmas color themes matching website color scheme (green primary, warm accents)
const PIECE_THEMES = [
  { bg: 'bg-emerald-600', border: 'border-emerald-400', shadow: 'shadow-emerald-500/50', emoji: '🎄' },
  { bg: 'bg-teal-600', border: 'border-teal-400', shadow: 'shadow-teal-500/50', emoji: '🎁' },
  { bg: 'bg-red-500', border: 'border-red-400', shadow: 'shadow-red-500/50', emoji: '🎀' },
  { bg: 'bg-amber-500', border: 'border-amber-300', shadow: 'shadow-amber-500/50', emoji: '⭐' },
  { bg: 'bg-green-700', border: 'border-green-500', shadow: 'shadow-green-500/50', emoji: '✨' },
  { bg: 'bg-rose-500', border: 'border-rose-400', shadow: 'shadow-rose-500/50', emoji: '🔔' },
  { bg: 'bg-cyan-600', border: 'border-cyan-400', shadow: 'shadow-cyan-500/50', emoji: '❄️' },
]

function rand<T>(arr: readonly T[]) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randIndex(len: number) {
  return Math.floor(Math.random() * len)
}

type Piece = {
  shape: string
  cells: [number, number][]
  x: number
  y: number
  id: number
  colorIdx: number
}

function rotateCW(cells: [number, number][]): [number, number][] {
  // Rotate 90 degrees clockwise: (x, y) -> (y, -x)
  const rotated = cells.map(([x, y]) => [y, -x] as [number, number])
  const minX = Math.min(...rotated.map(([x]) => x))
  const minY = Math.min(...rotated.map(([, y]) => y))
  return rotated.map(([x, y]) => [x - minX, y - minY] as [number, number])
}

function rotateCCW(cells: [number, number][]): [number, number][] {
  // Rotate 90 degrees counter-clockwise: (x, y) -> (-y, x)
  const rotated = cells.map(([x, y]) => [-y, x] as [number, number])
  const minX = Math.min(...rotated.map(([x]) => x))
  const minY = Math.min(...rotated.map(([, y]) => y))
  return rotated.map(([x, y]) => [x - minX, y - minY] as [number, number])
}

// Wall kick offsets for rotation
const WALL_KICKS: [number, number][] = [
  [0, 0], [-1, 0], [1, 0], [-2, 0], [2, 0], [0, -1], [-1, -1], [1, -1],
]

export const PresentTetris: React.FC<{ title?: string; description?: string }> = ({
  title = "Weihnachts-Tetris",
  description
}) => {
  const [board, setBoard] = useState<CellData[][]>(() =>
    Array.from({ length: HEIGHT }, () => Array.from({ length: WIDTH }, () => null))
  )
  const [current, setCurrent] = useState<Piece | null>(null)
  const [nextPiece, setNextPiece] = useState<Piece | null>(null)
  const [gameState, setGameState] = useState<'playing' | 'paused' | 'gameover'>('playing')
  const [score, setScore] = useState(0)
  const [lines, setLines] = useState(0)
  const [level, setLevel] = useState(1)
  const idRef = useRef(1)
  const boardRef = useRef(board)
  const gameContainerRef = useRef<HTMLDivElement>(null)

  // Keep boardRef in sync
  useEffect(() => {
    boardRef.current = board
  }, [board])

  const makePiece = useCallback((): Piece => {
    const shape = rand(SHAPE_KEYS)
    const raw = SHAPES[shape]
    const id = idRef.current++
    const colorIdx = randIndex(PIECE_THEMES.length)
    // Start centered at top
    const pieceWidth = Math.max(...raw.map(([cx]) => cx)) + 1
    const x = Math.floor((WIDTH - pieceWidth) / 2)
    const y = 0
    return { shape, cells: [...raw] as [number, number][], x, y, id, colorIdx }
  }, [])

  const canPlace = useCallback(
    (cells: [number, number][], px: number, py: number, checkBoard = boardRef.current) => {
      for (const [cx, cy] of cells) {
        const bx = px + cx
        const by = py + cy
        if (bx < 0 || bx >= WIDTH || by >= HEIGHT) return false
        if (by >= 0 && checkBoard[by][bx] !== null) return false
      }
      return true
    },
    []
  )

  const placePiece = useCallback((piece: Piece, targetBoard: CellData[][]) => {
    const next = targetBoard.map((r) => [...r])
    for (const [cx, cy] of piece.cells) {
      const bx = piece.x + cx
      const by = piece.y + cy
      if (by >= 0 && by < HEIGHT && bx >= 0 && bx < WIDTH) {
        next[by][bx] = { id: piece.id, colorIdx: piece.colorIdx }
      }
    }
    return next
  }, [])

  const clearFullLines = useCallback((targetBoard: CellData[][]) => {
    const rowsToKeep = targetBoard.filter((row) => row.some((cell) => cell === null))
    const linesCleared = HEIGHT - rowsToKeep.length
    if (linesCleared > 0) {
      const newRows: CellData[][] = Array.from({ length: linesCleared }, () =>
        Array.from({ length: WIDTH }, () => null)
      )
      return { board: [...newRows, ...rowsToKeep], linesCleared }
    }
    return { board: targetBoard, linesCleared: 0 }
  }, [])

  const spawnPiece = useCallback(
    (targetBoard: CellData[][]) => {
      const np = nextPiece ?? makePiece()
      const startX = Math.floor((WIDTH - (Math.max(...np.cells.map(([cx]) => cx)) + 1)) / 2)
      const newPiece = { ...np, x: startX, y: 0 }

      if (!canPlace(newPiece.cells, newPiece.x, newPiece.y, targetBoard)) {
        setGameState('gameover')
        setCurrent(null)
        return
      }

      setCurrent(newPiece)
      setNextPiece(makePiece())
    },
    [makePiece, nextPiece, canPlace]
  )

  // Initialize game
  useEffect(() => {
    const emptyBoard = Array.from({ length: HEIGHT }, () =>
      Array.from({ length: WIDTH }, () => null as CellData)
    )
    setBoard(emptyBoard)
    boardRef.current = emptyBoard
    setScore(0)
    setLines(0)
    setLevel(1)
    idRef.current = 1
    setGameState('playing')

    const firstPiece = makePiece()
    const secondPiece = makePiece()
    setNextPiece(secondPiece)
    setCurrent(firstPiece)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Game tick
  useEffect(() => {
    if (gameState !== 'playing' || !current) return

    const tickSpeed = Math.max(100, TICK_MS - (level - 1) * 50)

    const id = window.setInterval(() => {
      setCurrent((cur) => {
        if (!cur) return null
        const tryY = cur.y + 1

        if (canPlace(cur.cells, cur.x, tryY, boardRef.current)) {
          return { ...cur, y: tryY }
        }

        // Lock piece
        const newBoard = placePiece(cur, boardRef.current)
        const { board: clearedBoard, linesCleared } = clearFullLines(newBoard)

        setBoard(clearedBoard)
        boardRef.current = clearedBoard

        if (linesCleared > 0) {
          const points = [0, 100, 300, 500, 800][linesCleared] * level
          setScore((s) => s + points)
          setLines((l) => {
            const newLines = l + linesCleared
            setLevel(Math.floor(newLines / 10) + 1)
            return newLines
          })
        }

        // Spawn next piece
        setTimeout(() => spawnPiece(clearedBoard), 50)
        return null
      })
    }, tickSpeed)

    return () => clearInterval(id)
  }, [gameState, current, level, canPlace, placePiece, clearFullLines, spawnPiece])

  // Keyboard controls
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (gameState === 'gameover') return

      // Pause toggle
      if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
        setGameState((s) => (s === 'playing' ? 'paused' : s === 'paused' ? 'playing' : s))
        return
      }

      if (gameState !== 'playing' || !current) return

      e.preventDefault()

      if (e.key === 'ArrowLeft') {
        const nx = current.x - 1
        if (canPlace(current.cells, nx, current.y)) {
          setCurrent({ ...current, x: nx })
        }
      } else if (e.key === 'ArrowRight') {
        const nx = current.x + 1
        if (canPlace(current.cells, nx, current.y)) {
          setCurrent({ ...current, x: nx })
        }
      } else if (e.key === 'ArrowDown') {
        const ny = current.y + 1
        if (canPlace(current.cells, current.x, ny)) {
          setCurrent({ ...current, y: ny })
          setScore((s) => s + 1)
        }
      } else if (e.key === 'ArrowUp' || e.key === 'z' || e.key === 'Z') {
        // Rotate clockwise with wall kicks
        const rotated = rotateCW(current.cells)
        for (const [dx, dy] of WALL_KICKS) {
          if (canPlace(rotated, current.x + dx, current.y + dy)) {
            setCurrent({ ...current, cells: rotated, x: current.x + dx, y: current.y + dy })
            break
          }
        }
      } else if (e.key === 'x' || e.key === 'X') {
        // Rotate counter-clockwise with wall kicks
        const rotated = rotateCCW(current.cells)
        for (const [dx, dy] of WALL_KICKS) {
          if (canPlace(rotated, current.x + dx, current.y + dy)) {
            setCurrent({ ...current, cells: rotated, x: current.x + dx, y: current.y + dy })
            break
          }
        }
      } else if (e.key === ' ') {
        // Hard drop
        let ny = current.y
        while (canPlace(current.cells, current.x, ny + 1)) ny += 1
        const dropDistance = ny - current.y
        setScore((s) => s + dropDistance * 2)
        setCurrent({ ...current, y: ny })
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [gameState, current, canPlace])

  // Calculate ghost piece position
  const getGhostY = useCallback(() => {
    if (!current) return 0
    let ghostY = current.y
    while (canPlace(current.cells, current.x, ghostY + 1)) {
      ghostY += 1
    }
    return ghostY
  }, [current, canPlace])

  const ghostY = current ? getGhostY() : 0

  // Render the combined grid (board + current piece + ghost)
  const renderGrid = useCallback(() => {
    // Start with a copy of the board
    const combined: CellData[][] = board.map((r) =>
      r.map((cell) => (cell ? { ...cell } : null))
    )

    // Add ghost piece
    if (current && ghostY > current.y) {
      for (const [cx, cy] of current.cells) {
        const bx = current.x + cx
        const by = ghostY + cy
        if (by >= 0 && by < HEIGHT && bx >= 0 && bx < WIDTH && combined[by][bx] === null) {
          combined[by][bx] = { id: -1, colorIdx: current.colorIdx, isGhost: true }
        }
      }
    }

    // Add current piece
    if (current) {
      for (const [cx, cy] of current.cells) {
        const bx = current.x + cx
        const by = current.y + cy
        if (by >= 0 && by < HEIGHT && bx >= 0 && bx < WIDTH) {
          combined[by][bx] = { id: current.id, colorIdx: current.colorIdx, isCurrent: true }
        }
      }
    }

    return combined
  }, [board, current, ghostY])

  const combined = renderGrid()

  // Render preview piece in a 4x4 grid
  const renderPreview = useCallback(() => {
    if (!nextPiece) return null

    const grid: (boolean)[][] = Array.from({ length: 4 }, () => Array.from({ length: 4 }, () => false))

    // Center the piece in the preview
    const minX = Math.min(...nextPiece.cells.map(([x]) => x))
    const maxX = Math.max(...nextPiece.cells.map(([x]) => x))
    const minY = Math.min(...nextPiece.cells.map(([, y]) => y))
    const maxY = Math.max(...nextPiece.cells.map(([, y]) => y))
    const pieceW = maxX - minX + 1
    const pieceH = maxY - minY + 1
    const offsetX = Math.floor((4 - pieceW) / 2)
    const offsetY = Math.floor((4 - pieceH) / 2)

    for (const [cx, cy] of nextPiece.cells) {
      const gx = cx - minX + offsetX
      const gy = cy - minY + offsetY
      if (gx >= 0 && gx < 4 && gy >= 0 && gy < 4) {
        grid[gy][gx] = true
      }
    }

    const theme = PIECE_THEMES[nextPiece.colorIdx]

    return (
      <div className="grid grid-cols-4 gap-1">
        {grid.map((row, y) =>
          row.map((filled, x) => (
            <div
              key={`${x}-${y}`}
              className={cn(
                'w-6 h-6 rounded flex items-center justify-center transition-all duration-150',
                filled
                  ? `${theme.bg} border ${theme.border} shadow-sm`
                  : 'bg-muted/20 border border-transparent'
              )}
            >
              {filled && <span className="text-[10px] select-none">{theme.emoji}</span>}
            </div>
          ))
        )}
      </div>
    )
  }, [nextPiece])

  const restart = () => {
    const emptyBoard = Array.from({ length: HEIGHT }, () =>
      Array.from({ length: WIDTH }, () => null as CellData)
    )
    setBoard(emptyBoard)
    boardRef.current = emptyBoard
    setScore(0)
    setLines(0)
    setLevel(1)
    idRef.current = 1
    setGameState('playing')

    const firstPiece = makePiece()
    const secondPiece = makePiece()
    setNextPiece(secondPiece)
    setCurrent(firstPiece)
  }

  const togglePause = () => {
    if (gameState === 'gameover') return
    setGameState((s) => (s === 'playing' ? 'paused' : 'playing'))
  }

  return (
    <div
      ref={gameContainerRef}
      className="w-full max-w-2xl mx-auto select-none"
      tabIndex={0}
      onFocus={() => gameContainerRef.current?.focus()}
    >
      {/* Christmas-themed container */}
      <div className="relative rounded-2xl overflow-hidden bg-card border border-border shadow-sm">

        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🎅</span>
              <h3 className="text-2xl font-bold text-primary">
                {title}
              </h3>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                <span className="text-primary font-mono font-semibold">⭐ {score.toLocaleString()}</span>
              </div>
            </div>
          </div>
          {description && (
            <p className="mt-2 text-sm text-muted-foreground">{description}</p>
          )}
        </div>

        <div className="px-6 pb-6 flex justify-between gap-6">
          {/* Game Board */}
          <div className="relative">
            <div
              className="relative grid rounded-xl overflow-hidden border border-border bg-muted/30"
              style={{
                gridTemplateColumns: `repeat(${WIDTH}, 28px)`,
                gap: '1px',
                padding: '6px',
              }}
            >
              {combined.map((row, y) =>
                row.map((cell, x) => {
                  const isGhost = cell?.isGhost
                  const isCurrent = cell?.isCurrent
                  const theme = cell ? PIECE_THEMES[cell.colorIdx] : null

                  return (
                    <div
                      key={`${x}-${y}`}
                      className={cn(
                        'w-7 h-7 rounded-sm flex items-center justify-center transition-all duration-75',
                        cell && !isGhost
                          ? `${theme?.bg} border ${theme?.border} shadow-sm`
                          : isGhost
                            ? 'border border-dashed border-primary/40 bg-primary/10'
                            : 'bg-background/50 border border-muted-foreground/20'
                      )}
                      style={isCurrent ? { transform: 'scale(1.02)' } : undefined}
                    >
                      {cell && !isGhost && (
                        <span className="text-[10px] select-none drop-shadow-sm">{theme?.emoji}</span>
                      )}
                    </div>
                  )
                })
              )}
            </div>

            {/* Overlay for pause/gameover */}
            {gameState !== 'playing' && (
              <div className="absolute inset-0 bg-background/85 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <div className="text-center">
                  {gameState === 'paused' ? (
                    <>
                      <div className="text-4xl mb-2">⏸️</div>
                      <div className="text-xl font-bold text-foreground">Pausiert</div>
                      <div className="text-sm text-muted-foreground mt-1">Drücke P zum Fortfahren</div>
                    </>
                  ) : (
                    <>
                      <div className="text-4xl mb-2">🎄</div>
                      <div className="text-xl font-bold text-destructive">Spiel vorbei!</div>
                      <div className="text-sm text-muted-foreground mt-1">Punktzahl: {score.toLocaleString()}</div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-3 w-48">
            {/* Next Piece */}
            <div className="rounded-lg bg-muted/30 border border-border p-3">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-2">
                <span>🎁</span> Nächstes
              </div>
              <div className="flex justify-center">{renderPreview()}</div>
            </div>

            {/* Stats */}
            <div className="rounded-lg bg-muted/30 border border-border p-3">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Level</span>
                  <span className="text-lg font-bold text-primary">{level}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Reihen</span>
                  <span className="text-lg font-bold text-primary">{lines}</span>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="rounded-lg bg-muted/30 border border-border p-3">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Steuerung</div>
              <ul className="space-y-1 text-xs text-foreground">
                <li className="flex justify-between">
                  <span>Bewegen</span>
                  <span className="text-muted-foreground font-mono">← →</span>
                </li>
                <li className="flex justify-between">
                  <span>Fallen</span>
                  <span className="text-muted-foreground font-mono">↓</span>
                </li>
                <li className="flex justify-between">
                  <span>Schnell</span>
                  <span className="text-muted-foreground font-mono">Space</span>
                </li>
                <li className="flex justify-between">
                  <span>Drehen</span>
                  <span className="text-muted-foreground font-mono">↑ Z X</span>
                </li>
                <li className="flex justify-between">
                  <span>Pause</span>
                  <span className="text-muted-foreground font-mono">P</span>
                </li>
              </ul>
            </div>

            {/* Buttons */}
            <div className="flex flex-col gap-2 mt-auto">
              <button
                onClick={togglePause}
                disabled={gameState === 'gameover'}
                className={cn(
                  'w-full py-2 rounded-lg font-medium text-sm transition-all',
                  'bg-muted hover:bg-muted/80 border border-border',
                  'text-foreground',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                {gameState === 'playing' ? '⏸️ Pause' : '▶️ Weiter'}
              </button>
              <button
                onClick={restart}
                className={cn(
                  'w-full py-2 rounded-lg font-medium text-sm transition-all',
                  'bg-primary hover:bg-primary/90',
                  'text-primary-foreground'
                )}
              >
                🔄 Neustart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
