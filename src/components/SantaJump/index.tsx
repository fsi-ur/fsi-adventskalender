'use client'

import React, { useRef, useEffect, useState, useCallback } from 'react'
import { cn } from '@/utilities/ui'
import { Button } from '@/components/ui/button'

type GameState = 'playing' | 'won' | 'lost'

type House = {
  x: number
  y: number
  presentDelivered: boolean
}

type SantaJumpProps = {
  className?: string
}

const GAME_WIDTH = 400
const GAME_HEIGHT = 600
const SANTA_SIZE = 40
const HOUSE_WIDTH = 80
const HOUSE_HEIGHT = 24
const PRESENT_SIZE = 20
const GRAVITY = 0.5
const JUMP_VELOCITY = -11
const MOVE_SPEED = 5

function getInitialHouses(): House[] {
  return Array.from({ length: 6 }, (_, i) => ({
    x: 40 + Math.random() * (GAME_WIDTH - HOUSE_WIDTH - 80),
    y: GAME_HEIGHT - 100 - i * 90,
    presentDelivered: false,
  }))
}

export const SantaJump: React.FC<SantaJumpProps> = ({ className }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [gameState, setGameState] = useState<GameState>('playing')
  const [houses, setHouses] = useState<House[]>(getInitialHouses)
  const [presentsDelivered, setPresentsDelivered] = useState(0)
  const [showCelebration, setShowCelebration] = useState(false)

  const santa = useRef({
    x: GAME_WIDTH / 2 - SANTA_SIZE / 2,
    y: GAME_HEIGHT - 60,
    vx: 0,
    vy: 0,
  })

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') santa.current.vx = -MOVE_SPEED
      if (e.key === 'ArrowRight') santa.current.vx = MOVE_SPEED
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && santa.current.vx < 0) santa.current.vx = 0
      if (e.key === 'ArrowRight' && santa.current.vx > 0) santa.current.vx = 0
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  // Game loop
  useEffect(() => {
    let animationFrameId: number

    function gameLoop() {
      if (gameState !== 'playing') return

      // Physics
      santa.current.x += santa.current.vx
      santa.current.y += santa.current.vy
      santa.current.vy += GRAVITY

      // Boundary wrapping
      if (santa.current.x < 0) santa.current.x = 0
      if (santa.current.x > GAME_WIDTH - SANTA_SIZE) santa.current.x = GAME_WIDTH - SANTA_SIZE

      // Collision with houses (platforms)
      for (const house of houses) {
        if (
          santa.current.x + SANTA_SIZE > house.x &&
          santa.current.x < house.x + HOUSE_WIDTH &&
          santa.current.y + SANTA_SIZE > house.y &&
          santa.current.y + SANTA_SIZE < house.y + HOUSE_HEIGHT + 10 &&
          santa.current.vy > 0
        ) {
          santa.current.vy = JUMP_VELOCITY
        }
      }

      // Check for present collection
      setHouses((prevHouses) =>
        prevHouses.map((house) => {
          if (
            !house.presentDelivered &&
            santa.current.x + SANTA_SIZE > house.x + HOUSE_WIDTH / 2 - PRESENT_SIZE / 2 &&
            santa.current.x < house.x + HOUSE_WIDTH / 2 + PRESENT_SIZE / 2 &&
            santa.current.y < house.y - PRESENT_SIZE &&
            santa.current.y + SANTA_SIZE > house.y - PRESENT_SIZE
          ) {
            setPresentsDelivered((prev) => prev + 1)
            return { ...house, presentDelivered: true }
          }
          return house
        })
      )

      // Game over - fell off screen
      if (santa.current.y > GAME_HEIGHT) {
        setGameState('lost')
        return
      }

      // Win condition - all presents delivered
      if (houses.every((h) => h.presentDelivered)) {
        setGameState('won')
        setShowCelebration(true)
        setTimeout(() => setShowCelebration(false), 5000)
        return
      }

      // Draw game
      const ctx = canvasRef.current?.getContext('2d')
      if (ctx) {
        // Clear canvas
        ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT)

        // Draw sky gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT)
        gradient.addColorStop(0, '#e0f2fe')
        gradient.addColorStop(1, '#ffffff')
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT)

        // Draw houses
        houses.forEach((house) => {
          // House
          ctx.fillStyle = '#964B00'
          ctx.fillRect(house.x, house.y, HOUSE_WIDTH, HOUSE_HEIGHT)

          // Roof (triangle)
          ctx.fillStyle = '#c41e3a'
          ctx.beginPath()
          ctx.moveTo(house.x, house.y)
          ctx.lineTo(house.x + HOUSE_WIDTH / 2, house.y - 15)
          ctx.lineTo(house.x + HOUSE_WIDTH, house.y)
          ctx.fill()

          // Window
          ctx.fillStyle = '#FFD700'
          ctx.fillRect(house.x + 10, house.y + 5, 12, 12)
          ctx.strokeStyle = '#000'
          ctx.lineWidth = 1
          ctx.strokeRect(house.x + 10, house.y + 5, 12, 12)
          ctx.moveTo(house.x + 16, house.y + 5)
          ctx.lineTo(house.x + 16, house.y + 17)
          ctx.moveTo(house.x + 10, house.y + 11)
          ctx.lineTo(house.x + 22, house.y + 11)
          ctx.stroke()

          // Draw present above house
          if (!house.presentDelivered) {
            ctx.fillStyle = '#e63946'
            ctx.fillRect(
              house.x + HOUSE_WIDTH / 2 - PRESENT_SIZE / 2,
              house.y - PRESENT_SIZE - 10,
              PRESENT_SIZE,
              PRESENT_SIZE
            )

            // Present ribbon (gold cross)
            ctx.strokeStyle = '#FFD700'
            ctx.lineWidth = 2
            ctx.beginPath()
            ctx.moveTo(
              house.x + HOUSE_WIDTH / 2,
              house.y - PRESENT_SIZE - 10
            )
            ctx.lineTo(
              house.x + HOUSE_WIDTH / 2,
              house.y - 10
            )
            ctx.moveTo(
              house.x + HOUSE_WIDTH / 2 - PRESENT_SIZE / 2,
              house.y - PRESENT_SIZE / 2 - 10
            )
            ctx.lineTo(
              house.x + HOUSE_WIDTH / 2 + PRESENT_SIZE / 2,
              house.y - PRESENT_SIZE / 2 - 10
            )
            ctx.stroke()

            // Bow on top
            ctx.fillStyle = '#FFD700'
            ctx.beginPath()
            ctx.arc(
              house.x + HOUSE_WIDTH / 2,
              house.y - PRESENT_SIZE - 12,
              4,
              0,
              Math.PI * 2
            )
            ctx.fill()
          }
        })

        // Draw Santa
        ctx.save()

        // Santa body (circle)
        ctx.fillStyle = '#FF6B6B'
        ctx.beginPath()
        ctx.arc(
          santa.current.x + SANTA_SIZE / 2,
          santa.current.y + SANTA_SIZE / 2 + 5,
          SANTA_SIZE / 3,
          0,
          Math.PI * 2
        )
        ctx.fill()

        // Santa head (circle)
        ctx.fillStyle = '#FDBCB4'
        ctx.beginPath()
        ctx.arc(
          santa.current.x + SANTA_SIZE / 2,
          santa.current.y + 12,
          SANTA_SIZE / 2.5,
          0,
          Math.PI * 2
        )
        ctx.fill()

        // Santa hat
        ctx.fillStyle = '#c41e3a'
        ctx.beginPath()
        ctx.moveTo(santa.current.x + SANTA_SIZE / 2 - 12, santa.current.y + 8)
        ctx.lineTo(santa.current.x + SANTA_SIZE / 2 + 12, santa.current.y + 8)
        ctx.lineTo(santa.current.x + SANTA_SIZE / 2, santa.current.y - 10)
        ctx.fill()

        // Hat ball
        ctx.fillStyle = '#ffffff'
        ctx.beginPath()
        ctx.arc(
          santa.current.x + SANTA_SIZE / 2,
          santa.current.y - 12,
          3,
          0,
          Math.PI * 2
        )
        ctx.fill()

        // Eyes
        ctx.fillStyle = '#000'
        ctx.beginPath()
        ctx.arc(santa.current.x + SANTA_SIZE / 2 - 4, santa.current.y + 10, 2, 0, Math.PI * 2)
        ctx.arc(santa.current.x + SANTA_SIZE / 2 + 4, santa.current.y + 10, 2, 0, Math.PI * 2)
        ctx.fill()

        ctx.restore()
      }

      animationFrameId = requestAnimationFrame(gameLoop)
    }

    if (gameState === 'playing') {
      animationFrameId = requestAnimationFrame(gameLoop)
    }

    return () => cancelAnimationFrame(animationFrameId)
  }, [gameState, houses])

  const handleReset = useCallback(() => {
    setHouses(getInitialHouses())
    setPresentsDelivered(0)
    santa.current = {
      x: GAME_WIDTH / 2 - SANTA_SIZE / 2,
      y: GAME_HEIGHT - 60,
      vx: 0,
      vy: 0,
    }
    setGameState('playing')
    setShowCelebration(false)
  }, [])

  return (
    <div className={cn('flex flex-col items-center gap-6', className)}>
      {/* Header */}
      <div className="text-center">
        <div className="text-2xl sm:text-3xl mb-2">
          🎅 Santa Jump 🎄
        </div>
        <p className="text-sm text-muted-foreground mb-2">
          Steuere Santa mit <kbd className="px-2 py-1 bg-muted rounded">←</kbd> <kbd className="px-2 py-1 bg-muted rounded">→</kbd> und liefere alle Geschenke aus!
        </p>
      </div>

      {/* Celebration overlay */}
      {showCelebration && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className="text-6xl animate-bounce">🎉🎄🎅🎁🎉</div>
        </div>
      )}

      {/* Game Canvas */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={GAME_WIDTH}
          height={GAME_HEIGHT}
          className="border-4 border-green-700 dark:border-green-500 rounded-lg shadow-xl bg-white"
          tabIndex={0}
          aria-label="Santa Jump Spiel"
        />

        {/* Corner decorations */}
        <div className="absolute -top-3 -left-3 text-2xl">❄️</div>
        <div className="absolute -top-3 -right-3 text-2xl">❄️</div>
        <div className="absolute -bottom-3 -left-3 text-2xl">🎁</div>
        <div className="absolute -bottom-3 -right-3 text-2xl">🎁</div>
      </div>

      {/* Status and Controls */}
      <div className="w-full max-w-md flex flex-col gap-4">
        {/* Status Bar */}
        <div className="text-center p-4 bg-card rounded-lg border border-border shadow-sm">
          {gameState === 'playing' && (
            <div className="text-lg font-semibold">
              Geschenke verteilt: <span className="text-green-600">{presentsDelivered}</span> / {houses.length}
            </div>
          )}
          {gameState === 'won' && (
            <div className="text-lg font-semibold text-green-600 animate-pulse">
              ✨ Alle Geschenke verteilt! Frohe Weihnachten! ✨
            </div>
          )}
          {gameState === 'lost' && (
            <div className="text-lg font-semibold text-red-500">
              😱 Santa ist gefallen!
            </div>
          )}
        </div>

        {/* Control Buttons */}
        <div className="flex flex-wrap justify-center gap-2">
          <Button
            onClick={handleReset}
            variant="outline"
            size="sm"
            className={cn(
              gameState !== 'playing' && 'border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
            )}
          >
            🔄 {gameState === 'playing' ? 'Neustart' : 'Nochmal spielen'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default SantaJump