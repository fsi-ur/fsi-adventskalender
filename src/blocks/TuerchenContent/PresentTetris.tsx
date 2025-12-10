'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { cn } from '@/utilities/ui'

// Christmas-themed Tetris (presents) component
// Narrow chimney-style board: width = 6, height = 14 (so it feels like chimney)
// User controls: ← → down, z / x rotate, space = drop
// Presents are emoji tiles and have colored wrappers

type Cell = number // 0 = empty, >0 = id of filled block

const WIDTH = 6
const HEIGHT = 14
const TICK_MS = 650

// Tetromino shapes (4-cell) represented as arrays of [x,y] coords
const SHAPES = {
  I: [
    [0, 1],
    [1, 1],
    [2, 1],
    [3, 1],
  ],
  O: [
    [0, 0],
    [1, 0],
    [0, 1],
    [1, 1],
  ],
  T: [
    [1, 0],
    [0, 1],
    [1, 1],
    [2, 1],
  ],
  L: [
    [0, 0],
    [0, 1],
    [1, 1],
    [2, 1],
  ],
  J: [
    [2, 0],
    [0, 1],
    [1, 1],
    [2, 1],
  ],
  S: [
    [1, 0],
    [2, 0],
    [0, 1],
    [1, 1],
  ],
  Z: [
    [0, 0],
    [1, 0],
    [1, 1],
    [2, 1],
  ],
} as const

const SHAPE_KEYS = Object.keys(SHAPES) as (keyof typeof SHAPES)[]

const PRESENT_EMOJIS = ['🎁', '🎄', '🧸', '🛷', '🔔', '✨']
const PRESENT_COLORS = ['bg-red-600', 'bg-green-600', 'bg-yellow-400', 'bg-indigo-600', 'bg-rose-500', 'bg-amber-400']

function rand<T>(arr: readonly T[]) {
  return arr[Math.floor(Math.random() * arr.length)]
}

type Piece = {
  shape: keyof typeof SHAPES
  cells: [number, number][]
  x: number
  y: number
  id: number
  emoji: string
  colorClass: string
}

function rotateCells(cells: [number, number][]) {
  // rotate 90deg around origin (x,y) -> (y, -x) and normalize so min coords >=0
  const rotated = cells.map(([x, y]) => [y, -x] as [number, number])
  // normalize to min x >=0 and min y >=0
  const minX = Math.min(...rotated.map(([x]) => x))
  const minY = Math.min(...rotated.map(([, y]) => y))
  return rotated.map(([x, y]) => [x - minX, y - minY] as [number, number])
}

export const PresentTetris: React.FC<{ title?: string }> = ({ title = 'Santa\'s Chimney' }) => {
  const [board, setBoard] = useState<Cell[][]>(() => Array.from({ length: HEIGHT }, () => Array.from({ length: WIDTH }, () => 0)))
  const [current, setCurrent] = useState<Piece | null>(null)
  const [nextPiece, setNextPiece] = useState<Piece | null>(null)
  const [running, setRunning] = useState(true)
  const [score, setScore] = useState(0)
  const [maxPresents, setMaxPresents] = useState(0)
  const idRef = useRef(1)
  const tickRef = useRef<number | null>(null)

  const makePiece = useCallback((): Piece => {
    const shape = rand(SHAPE_KEYS)
    const raw = SHAPES[shape]
    const id = idRef.current++
    const emoji = rand(PRESENT_EMOJIS)
    const colorClass = rand(PRESENT_COLORS)
    // start near top-centered
    const x = Math.floor((WIDTH - Math.max(...raw.map(([cx]) => cx)) - 1) / 2)
    const y = 0
    return { shape, cells: raw as any, x, y, id, emoji, colorClass }
  }, [])

  const canPlace = useCallback((piece: Piece, px = piece.x, py = piece.y, cells = piece.cells) => {
    for (const [cx, cy] of cells) {
      const bx = px + cx
      const by = py + cy
      if (bx < 0 || bx >= WIDTH || by < 0 || by >= HEIGHT) return false
      if (board[by][bx] !== 0) return false
    }
    return true
  }, [board])

  const placePiece = useCallback((piece: Piece) => {
    setBoard((prev) => {
      const next = prev.map((r) => [...r])
      for (const [cx, cy] of piece.cells) {
        const bx = piece.x + cx
        const by = piece.y + cy
        if (by >= 0 && by < HEIGHT && bx >= 0 && bx < WIDTH) next[by][bx] = piece.id
      }
      return next
    })
  }, [])

  const clearFullLines = useCallback(() => {
    setBoard((prev) => {
      const rowsToKeep = prev.filter((row) => row.some((cell) => cell === 0))
      const linesCleared = HEIGHT - rowsToKeep.length
      if (linesCleared > 0) {
        const newRows = Array.from({ length: linesCleared }, () => Array.from({ length: WIDTH }, () => 0))
        setScore((s) => s + linesCleared * 100)
        // santa: higher score => more presents down chimney
        setMaxPresents((p) => Math.max(p, prev.flat().filter(Boolean).length))
        return [...newRows, ...rowsToKeep]
      }
      return prev
    })
  }, [])

  const spawnNext = useCallback(() => {
    const np = nextPiece ?? makePiece()
    // reset next
    setCurrent({ ...np })
    setNextPiece(makePiece())
  }, [makePiece, nextPiece])

  const gameOver = useCallback(() => {
    setRunning(false)
    setCurrent(null)
  }, [])

  // initialize
  useEffect(() => {
    setBoard(Array.from({ length: HEIGHT }, () => Array.from({ length: WIDTH }, () => 0)))
    setScore(0)
    setMaxPresents(0)
    idRef.current = 1
    setNextPiece(makePiece())
    setTimeout(() => spawnNext(), 50)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!running) return
    if (!current) return
    // tick to move down
    const id = window.setInterval(() => {
      setCurrent((cur) => {
        if (!cur) return null
        const tryY = cur.y + 1
        if (canPlace(cur, cur.x, tryY)) {
          return { ...cur, y: tryY }
        }
        // place and clear
        placePiece(cur)
        clearFullLines()
        spawnNext()
        return null
      })
    }, TICK_MS)
    tickRef.current = id
    return () => clearInterval(id)
  }, [running, current, canPlace, placePiece, clearFullLines, spawnNext])

  // keyboard
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!running || !current) return
      if (e.key === 'ArrowLeft') {
        const nx = current.x - 1
        if (canPlace(current, nx, current.y)) setCurrent({ ...current, x: nx })
      } else if (e.key === 'ArrowRight') {
        const nx = current.x + 1
        if (canPlace(current, nx, current.y)) setCurrent({ ...current, x: nx })
      } else if (e.key === 'ArrowDown') {
        const ny = current.y + 1
        if (canPlace(current, current.x, ny)) setCurrent({ ...current, y: ny })
      } else if (e.key === 'z' || e.key === 'Z') {
        const rotated = rotateCells(current.cells)
        if (canPlace(current, current.x, current.y, rotated as any)) setCurrent({ ...current, cells: rotated as any })
      } else if (e.key === 'x' || e.key === 'X') {
        // rotate other direction (3x rotation)
        let rotated = rotateCells(current.cells)
        rotated = rotateCells(rotated)
        rotated = rotateCells(rotated)
        if (canPlace(current, current.x, current.y, rotated as any)) setCurrent({ ...current, cells: rotated as any })
      } else if (e.key === ' ') {
        // hard drop
        let ny = current.y
        while (canPlace(current, current.x, ny + 1)) ny += 1
        setCurrent({ ...current, y: ny })
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [running, current, canPlace])

  // when current becomes null, spawn next (if queue emptied by tick)
  useEffect(() => {
    if (!current && running) {
      // small delay to allow placePiece to update board
      setTimeout(() => {
        // if next piece can't be placed -> game over
        const np = nextPiece ?? makePiece()
        const startPiece = { ...np }
        if (!canPlace(startPiece, startPiece.x, startPiece.y)) {
          gameOver()
        } else {
          setCurrent(startPiece)
          setNextPiece(makePiece())
        }
      }, 80)
    }
  }, [current, running, makePiece, nextPiece, canPlace, gameOver])

  // render board combining current piece
  const renderGrid = useCallback(() => {
    const combined = board.map((r) => [...r])
    if (current) {
      for (const [cx, cy] of current.cells) {
        const bx = current.x + cx
        const by = current.y + cy
        if (by >= 0 && by < HEIGHT && bx >= 0 && bx < WIDTH) combined[by][bx] = current.id
      }
    }
    return combined
  }, [board, current])

  const combined = renderGrid()

  const restart = () => {
    setBoard(Array.from({ length: HEIGHT }, () => Array.from({ length: WIDTH }, () => 0)))
    setScore(0)
    setMaxPresents(0)
    idRef.current = 1
    setRunning(true)
    const np = makePiece()
    setNextPiece(np)
    setCurrent(null)
    setTimeout(() => spawnNext(), 60)
  }

  const pauseToggle = () => {
    setRunning((r) => !r)
  }

  return (
    <div className="w-full max-w-xl">
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">🎅 {title}</h3>
          <div className="text-sm text-muted-foreground">Score: {score} • Presents stacked: {maxPresents}</div>
        </div>

        <div className="mt-4 flex gap-4">
          {/* Board */}
          <div className="relative">
            <div className="grid" style={{ gridTemplateColumns: `repeat(${WIDTH}, 36px)`, gap: 4 }}>
              {combined.map((row, y) => (
                row.map((cell, x) => {
                  const filled = Boolean(cell)
                  // determine color / emoji if filled; for simplicity color by id
                  const colorClass = filled ? PRESENT_COLORS[(cell - 1) % PRESENT_COLORS.length] : 'bg-transparent'
                  const emoji = filled ? PRESENT_EMOJIS[(cell - 1) % PRESENT_EMOJIS.length] : ''
                  return (
                    <div
                      key={`${x}-${y}`}
                      className={cn('h-9 w-9 flex items-center justify-center rounded-sm border', filled ? 'border-transparent' : 'border-gray-200', colorClass)}
                    >
                      <span className="text-sm select-none" aria-hidden>{emoji}</span>
                    </div>
                  )
                })
              ))}
            </div>
            {/* faint chimney overlay */}
            <div className="pointer-events-none absolute inset-0 flex items-start justify-center">
              <div className="h-full w-2/3 border-l-4 border-r-4 border-dashed border-gray-200 opacity-30" />
            </div>
          </div>

          {/* Sidebar controls */}
          <div className="flex w-48 flex-col items-stretch gap-3">
            <div className="rounded-md border border-border p-2">
              <div className="text-xs text-muted-foreground">Next</div>
              <div className="mt-2 grid grid-cols-4 gap-1">
                {nextPiece?.cells.map(([cx, cy], idx) => (
                  <div key={idx} className="h-6 w-6 flex items-center justify-center rounded-sm bg-red-500 text-white text-xs">{nextPiece.emoji}</div>
                ))}
              </div>
            </div>

            <div className="rounded-md border border-border p-2 text-sm">
              Controls:
              <ul className="mt-2 list-disc pl-5 text-xs">
                <li>← →: move</li>
                <li>↓: soft drop</li>
                <li>Space: hard drop</li>
                <li>Z / X: rotate</li>
              </ul>
            </div>

            <div className="flex gap-2">
              <button onClick={pauseToggle} className="flex-1 rounded bg-slate-700 px-2 py-1 text-white">{running ? 'Pause' : 'Resume'}</button>
              <button onClick={restart} className="flex-1 rounded bg-amber-500 px-2 py-1 text-white">Restart</button>
            </div>

            <div className="rounded-md border border-border p-2 text-sm">
              <div className="text-xs text-muted-foreground">Story</div>
              <div className="mt-1 text-xs">Santa is trying to stack as many presents down the chimney as possible — avoid overflow!</div>
            </div>
          </div>
        </div>

        {!running && (
          <div className="mt-3 rounded bg-red-50 p-3 text-center text-sm text-red-700">Game paused or ended. Press Restart to try again.</div>
        )}
      </div>
    </div>
  )
}
