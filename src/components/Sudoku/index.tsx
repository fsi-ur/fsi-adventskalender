 'use client'

import React, { useState, useCallback, useMemo, useEffect } from 'react'
import { cn } from '@/utilities/ui'
import { Button } from '@/components/ui/button'

type SudokuGrid = (number | null)[][]
type SudokuPuzzle = {
  puzzle: SudokuGrid
  solution: SudokuGrid
}

// Pre-defined solved Sudoku grids for generating random puzzles
const SOLVED_GRIDS: SudokuGrid[] = [
  [
    [5, 3, 4, 6, 7, 8, 9, 1, 2],
    [6, 7, 2, 1, 9, 5, 3, 4, 8],
    [1, 9, 8, 3, 4, 2, 5, 6, 7],
    [8, 5, 9, 7, 6, 1, 4, 2, 3],
    [4, 2, 6, 8, 5, 3, 7, 9, 1],
    [7, 1, 3, 9, 2, 4, 8, 5, 6],
    [9, 6, 1, 5, 3, 7, 2, 8, 4],
    [2, 8, 7, 4, 1, 9, 6, 3, 5],
    [3, 4, 5, 2, 8, 6, 1, 7, 9],
  ],
  [
    [4, 3, 5, 2, 6, 9, 7, 8, 1],
    [6, 8, 2, 5, 7, 1, 4, 9, 3],
    [1, 9, 7, 8, 3, 4, 5, 6, 2],
    [8, 2, 6, 1, 9, 5, 3, 4, 7],
    [3, 7, 4, 6, 8, 2, 9, 1, 5],
    [9, 5, 1, 7, 4, 3, 6, 2, 8],
    [5, 1, 9, 3, 2, 6, 8, 7, 4],
    [2, 4, 8, 9, 5, 7, 1, 3, 6],
    [7, 6, 3, 4, 1, 8, 2, 5, 9],
  ],
  [
    [1, 2, 3, 6, 7, 8, 9, 4, 5],
    [5, 8, 4, 2, 3, 9, 7, 6, 1],
    [9, 6, 7, 1, 4, 5, 3, 2, 8],
    [3, 7, 2, 4, 6, 1, 5, 8, 9],
    [6, 9, 1, 5, 8, 3, 2, 7, 4],
    [4, 5, 8, 7, 9, 2, 6, 1, 3],
    [8, 3, 6, 9, 2, 4, 1, 5, 7],
    [2, 1, 9, 8, 5, 7, 4, 3, 6],
    [7, 4, 5, 3, 1, 6, 8, 9, 2],
  ],
]

// Generate a random puzzle from a solved grid by removing cells
const generateRandomPuzzle = (solvedGrid: SudokuGrid, cellsToRemove: number = 40): SudokuPuzzle => {
  // Deep copy the solution
  const solution = solvedGrid.map(row => [...row])
  const puzzle: SudokuGrid = solvedGrid.map(row => [...row])

  // Get all cell positions
  const positions: [number, number][] = []
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      positions.push([r, c])
    }
  }

  // Shuffle positions using Fisher-Yates
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[positions[i], positions[j]] = [positions[j], positions[i]]
  }

  // Remove cells
  for (let i = 0; i < cellsToRemove && i < positions.length; i++) {
    const [r, c] = positions[i]
    puzzle[r][c] = null
  }

  return { puzzle, solution }
}

// Generate a unique puzzle on each call
const generateChristmasPuzzle = (): SudokuPuzzle => {
  const gridIndex = Math.floor(Math.random() * SOLVED_GRIDS.length)
  // Remove 35-45 cells for easy difficulty
  const cellsToRemove = 35 + Math.floor(Math.random() * 11)
  return generateRandomPuzzle(SOLVED_GRIDS[gridIndex], cellsToRemove)
}

// Christmas-themed number representations
const CHRISTMAS_SYMBOLS: Record<number, string> = {
  1: '🎄',
  2: '⭐',
  3: '🎅',
  4: '🦌',
  5: '🎁',
  6: '❄️',
  7: '🔔',
  8: '🕯️',
  9: '🎀',
}

type CellState = {
  value: number | null
  isOriginal: boolean
  isError: boolean
  notes: Set<number>
}

type SudokuProps = {
  puzzleIndex?: number
  customPuzzle?: SudokuPuzzle
  useSymbols?: boolean
  className?: string
}

const MAX_HINTS = 5

export const Sudoku: React.FC<SudokuProps> = ({
  customPuzzle,
  useSymbols = false,
  className,
}) => {
  // Generate a unique puzzle on mount (or use custom if provided)
  const [puzzle, setPuzzle] = useState<SudokuPuzzle>(() => customPuzzle || generateChristmasPuzzle())

  // Initialize grid state
  const initializeGrid = useCallback((): CellState[][] => {
    return puzzle.puzzle.map((row: (number | null)[]) =>
      row.map((cell: number | null) => ({
        value: cell,
        isOriginal: cell !== null,
        isError: false,
        notes: new Set<number>(),
      }))
    )
  }, [puzzle])

  const [grid, setGrid] = useState<CellState[][]>(initializeGrid)
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null)
  const [isNotesMode, setIsNotesMode] = useState(false)
  const [showSymbols, setShowSymbols] = useState(useSymbols)
  const [isComplete, setIsComplete] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)
  const [mistakes, setMistakes] = useState(0)
  const [hintsUsed, setHintsUsed] = useState(0)

  // Check if puzzle is complete
  useEffect(() => {
    const allFilled = grid.every((row) => row.every((cell) => cell.value !== null))
    const noErrors = grid.every((row) => row.every((cell) => !cell.isError))

    if (allFilled && noErrors) {
      // Verify against solution
      const isCorrect = grid.every((row, rowIndex) =>
        row.every((cell, colIndex) => cell.value === puzzle.solution[rowIndex][colIndex])
      )
      if (isCorrect && !isComplete) {
        setIsComplete(true)
        setShowCelebration(true)
        setTimeout(() => setShowCelebration(false), 5000)
      }
    }
  }, [grid, puzzle.solution, isComplete])

  // Check if a value is valid at position
  const isValidPlacement = useCallback(
    (row: number, col: number, value: number): boolean => {
      // Check row
      for (let c = 0; c < 9; c++) {
        if (c !== col && grid[row][c].value === value) return false
      }
      // Check column
      for (let r = 0; r < 9; r++) {
        if (r !== row && grid[r][col].value === value) return false
      }
      // Check 3x3 box
      const boxRow = Math.floor(row / 3) * 3
      const boxCol = Math.floor(col / 3) * 3
      for (let r = boxRow; r < boxRow + 3; r++) {
        for (let c = boxCol; c < boxCol + 3; c++) {
          if ((r !== row || c !== col) && grid[r][c].value === value) return false
        }
      }
      return true
    },
    [grid]
  )

  // Handle number input
  const handleNumberInput = useCallback(
    (num: number) => {
      if (!selectedCell) return
      const { row, col } = selectedCell
      if (grid[row][col].isOriginal) return

      setGrid((prev) => {
        const newGrid = prev.map((r) => r.map((c) => ({ ...c, notes: new Set(c.notes) })))

        if (isNotesMode) {
          // Toggle note
          const cell = newGrid[row][col]
          if (cell.notes.has(num)) {
            cell.notes.delete(num)
          } else {
            cell.notes.add(num)
          }
          cell.value = null
        } else {
          // Set value
          const isValid = isValidPlacement(row, col, num)
          newGrid[row][col] = {
            ...newGrid[row][col],
            value: num,
            isError: !isValid,
            notes: new Set(),
          }
          if (!isValid) {
            setMistakes((m) => m + 1)
          }
          // Clear notes from related cells
          for (let i = 0; i < 9; i++) {
            newGrid[row][i].notes.delete(num)
            newGrid[i][col].notes.delete(num)
          }
          const boxRow = Math.floor(row / 3) * 3
          const boxCol = Math.floor(col / 3) * 3
          for (let r = boxRow; r < boxRow + 3; r++) {
            for (let c = boxCol; c < boxCol + 3; c++) {
              newGrid[r][c].notes.delete(num)
            }
          }
        }
        return newGrid
      })
    },
    [selectedCell, grid, isNotesMode, isValidPlacement]
  )

  // Clear selected cell
  const handleClear = useCallback(() => {
    if (!selectedCell) return
    const { row, col } = selectedCell
    if (grid[row][col].isOriginal) return

    setGrid((prev) => {
      const newGrid = prev.map((r) => r.map((c) => ({ ...c, notes: new Set(c.notes) })))
      newGrid[row][col] = {
        ...newGrid[row][col],
        value: null,
        isError: false,
        notes: new Set(),
      }
      return newGrid
    })
  }, [selectedCell, grid])

  // Reset puzzle (generates a new random puzzle)
  const handleReset = useCallback(() => {
    const newPuzzle = customPuzzle || generateChristmasPuzzle()
    setPuzzle(newPuzzle)
    setGrid(
      newPuzzle.puzzle.map((row: (number | null)[]) =>
        row.map((cell: number | null) => ({
          value: cell,
          isOriginal: cell !== null,
          isError: false,
          notes: new Set<number>(),
        }))
      )
    )
    setSelectedCell(null)
    setIsComplete(false)
    setMistakes(0)
    setHintsUsed(0)
  }, [customPuzzle])

  // Get hint (limited to MAX_HINTS per game)
  const handleHint = useCallback(() => {
    if (hintsUsed >= MAX_HINTS) return

    // Find an empty cell and reveal its value
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (grid[row][col].value === null) {
          setGrid((prev) => {
            const newGrid = prev.map((r) => r.map((c) => ({ ...c, notes: new Set(c.notes) })))
            newGrid[row][col] = {
              value: puzzle.solution[row][col],
              isOriginal: false,
              isError: false,
              notes: new Set(),
            }
            return newGrid
          })
          setSelectedCell({ row, col })
          setHintsUsed((h) => h + 1)
          return
        }
      }
    }
  }, [grid, puzzle.solution, hintsUsed])

  // Keyboard handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedCell) return

      const num = parseInt(e.key)
      if (num >= 1 && num <= 9) {
        handleNumberInput(num)
        return
      }

      const { row, col } = selectedCell
      switch (e.key) {
        case 'ArrowUp':
          if (row > 0) setSelectedCell({ row: row - 1, col })
          break
        case 'ArrowDown':
          if (row < 8) setSelectedCell({ row: row + 1, col })
          break
        case 'ArrowLeft':
          if (col > 0) setSelectedCell({ row, col: col - 1 })
          break
        case 'ArrowRight':
          if (col < 8) setSelectedCell({ row, col: col + 1 })
          break
        case 'Backspace':
        case 'Delete':
          handleClear()
          break
        case 'n':
        case 'N':
          setIsNotesMode((prev) => !prev)
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedCell, handleNumberInput, handleClear])

  // Check if cell is in same row/col/box as selected
  const isRelatedCell = useMemo(() => {
    if (!selectedCell) return () => false
    return (row: number, col: number) => {
      if (row === selectedCell.row || col === selectedCell.col) return true
      const boxRow = Math.floor(selectedCell.row / 3) * 3
      const boxCol = Math.floor(selectedCell.col / 3) * 3
      return (
        row >= boxRow &&
        row < boxRow + 3 &&
        col >= boxCol &&
        col < boxCol + 3
      )
    }
  }, [selectedCell])

  // Render cell value
  const renderCellValue = (cell: CellState) => {
    if (cell.value === null) {
      if (cell.notes.size > 0) {
        return (
          <div className="grid grid-cols-3 gap-0 text-[8px] sm:text-[10px] text-muted-foreground leading-none w-full h-full p-0.5">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
              <span key={n} className="flex items-center justify-center">
                {cell.notes.has(n) ? (showSymbols ? CHRISTMAS_SYMBOLS[n] : n) : ''}
              </span>
            ))}
          </div>
        )
      }
      return null
    }
    return showSymbols ? CHRISTMAS_SYMBOLS[cell.value] : cell.value
  }

  return (
    <div className={cn('flex flex-col items-center gap-6', className)}>
      {/* Header with Christmas decorations */}
      <div className="text-center">
        <div className="text-2xl sm:text-3xl mb-2">
          🎄 Weihnachts-Sudoku 🎄
        </div>
        <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
          <span>Fehler: <span className="text-red-500 font-semibold">{mistakes}</span></span>
          {isComplete && (
            <span className="text-green-500 font-semibold animate-pulse">
              ✨ Gelöst! ✨
            </span>
          )}
        </div>
      </div>

      {/* Celebration overlay */}
      {showCelebration && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className="text-6xl animate-bounce">🎉🎄🎅🎁🎉</div>
        </div>
      )}

      {/* Sudoku Grid */}
      <div className="relative">
        <div
          className="grid grid-cols-9 gap-0 border-4 border-green-700 dark:border-green-500 rounded-lg overflow-hidden bg-card shadow-xl"
          style={{
            backgroundImage: 'linear-gradient(135deg, rgba(34, 197, 94, 0.05) 0%, rgba(239, 68, 68, 0.05) 100%)'
          }}
        >
          {grid.map((row, rowIndex) =>
            row.map((cell, colIndex) => {
              const isSelected = selectedCell?.row === rowIndex && selectedCell?.col === colIndex
              const isRelated = isRelatedCell(rowIndex, colIndex)
              const sameValue = selectedCell &&
                cell.value !== null &&
                grid[selectedCell.row][selectedCell.col].value === cell.value

              return (
                <button
                  key={`${rowIndex}-${colIndex}`}
                  onClick={() => setSelectedCell({ row: rowIndex, col: colIndex })}
                  className={cn(
                    'w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center',
                    'text-base sm:text-lg md:text-xl font-semibold',
                    'transition-all duration-150 outline-none',
                    'border-r border-b border-green-200 dark:border-green-800',
                    // Box borders
                    colIndex % 3 === 2 && colIndex !== 8 && 'border-r-2 border-r-green-700 dark:border-r-green-500',
                    rowIndex % 3 === 2 && rowIndex !== 8 && 'border-b-2 border-b-green-700 dark:border-b-green-500',
                    // States
                    isSelected && 'bg-green-200 dark:bg-green-800',
                    !isSelected && isRelated && 'bg-green-50 dark:bg-green-900/30',
                    !isSelected && sameValue && 'bg-green-100 dark:bg-green-800/50',
                    cell.isOriginal && 'text-foreground',
                    !cell.isOriginal && !cell.isError && 'text-green-600 dark:text-green-400',
                    cell.isError && 'text-red-500 bg-red-100 dark:bg-red-900/30',
                    // Hover
                    !isSelected && 'hover:bg-green-100 dark:hover:bg-green-800/30',
                  )}
                  disabled={isComplete}
                >
                  {renderCellValue(cell)}
                </button>
              )
            })
          )}
        </div>

        {/* Christmas decorations on corners */}
        <div className="absolute -top-3 -left-3 text-2xl">❄️</div>
        <div className="absolute -top-3 -right-3 text-2xl">❄️</div>
        <div className="absolute -bottom-3 -left-3 text-2xl">🎁</div>
        <div className="absolute -bottom-3 -right-3 text-2xl">🎁</div>
      </div>

      {/* Number input buttons */}
      <div className="flex flex-col gap-3 w-full max-w-md">
        <div className="grid grid-cols-9 gap-1 sm:gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleNumberInput(num)}
              disabled={isComplete}
              className={cn(
                'aspect-square rounded-lg font-semibold text-lg sm:text-xl',
                'border-2 transition-all duration-150',
                'flex items-center justify-center',
                isNotesMode
                  ? 'border-amber-400 dark:border-amber-500 bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-800/30'
                  : 'border-green-500 dark:border-green-600 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-800/30',
                'disabled:opacity-50 disabled:cursor-not-allowed',
              )}
            >
              {showSymbols ? CHRISTMAS_SYMBOLS[num] : num}
            </button>
          ))}
        </div>

        {/* Control buttons */}
        <div className="flex flex-wrap justify-center gap-2">
          <Button
            onClick={() => setIsNotesMode(!isNotesMode)}
            variant={isNotesMode ? 'default' : 'outline'}
            size="sm"
            className={cn(
              isNotesMode && 'bg-amber-500 hover:bg-amber-600'
            )}
          >
            ✏️ Notizen {isNotesMode ? 'An' : 'Aus'}
          </Button>

          <Button
            onClick={handleClear}
            variant="outline"
            size="sm"
            disabled={isComplete}
          >
            🗑️ Löschen
          </Button>

          <Button
            onClick={handleHint}
            variant="outline"
            size="sm"
            disabled={isComplete || hintsUsed >= MAX_HINTS}
          >
            💡 Hinweis ({MAX_HINTS - hintsUsed})
          </Button>

          <Button
            onClick={() => setShowSymbols(!showSymbols)}
            variant="outline"
            size="sm"
          >
            {showSymbols ? '🔢 Zahlen' : '🎄 Symbole'}
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
      </div>

      {/* Legend for symbols mode */}
      {showSymbols && (
        <div className="mt-4 p-4 bg-card rounded-lg border border-border shadow-sm">
          <div className="text-sm font-medium text-center mb-2">Legende</div>
          <div className="grid grid-cols-3 sm:grid-cols-9 gap-2 text-center text-sm">
            {Object.entries(CHRISTMAS_SYMBOLS).map(([num, symbol]) => (
              <div key={num} className="flex flex-col items-center gap-1">
                <span className="text-lg">{symbol}</span>
                <span className="text-muted-foreground">= {num}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Sudoku
