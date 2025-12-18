'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/utilities/ui'

type Difficulty = 'cozy' | 'brisk' | 'blizzard'
type GameState = 'ready' | 'playing' | 'lost'

type PlatformType = 'static' | 'moving' | 'gift' | 'crumbly'

type Platform = {
  id: number
  x: number
  y: number
  width: number
  height: number
  type: PlatformType
  vx?: number
  ttl?: number
  giftCollected?: boolean
}

type Snowflake = {
  x: number
  y: number
  size: number
  speed: number
  sway: number
  offset: number
}

const GAME_WIDTH = 360
const GAME_HEIGHT = 560
const PLAYER_WIDTH = 34
const PLAYER_HEIGHT = 44
const MOVE_SPEED = 3.6

const SETTINGS: Record<Difficulty, { gravity: number; jump: number; gap: number; moving: number; crumble: number; gift: number }> = {
  cozy: { gravity: 0.36, jump: -9.8, gap: 82, moving: 0.12, crumble: 0.06, gift: 0.14 },
  brisk: { gravity: 0.39, jump: -10.3, gap: 88, moving: 0.18, crumble: 0.1, gift: 0.12 },
  blizzard: { gravity: 0.42, jump: -10.8, gap: 94, moving: 0.24, crumble: 0.16, gift: 0.1 },
}

const platformColors: Record<PlatformType, { base: string; accent: string }> = {
  static: { base: '#f3f6f8', accent: '#8fbac8' },
  moving: { base: '#dff4ff', accent: '#5bb0d5' },
  gift: { base: '#fff2c2', accent: '#d1971b' },
  crumbly: { base: '#ffe3e3', accent: '#c65d5d' },
}

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))
const rand = (min: number, max: number) => min + Math.random() * (max - min)
const roundedRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) => {
  const radius = Math.min(r, Math.min(w, h) / 2)
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + w - radius, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius)
  ctx.lineTo(x + w, y + h - radius)
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h)
  ctx.lineTo(x + radius, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius)
  ctx.lineTo(x, y + radius)
  ctx.quadraticCurveTo(x, y, x + radius, y)
  ctx.closePath()
}

export type ChristmasDoodleJumpProps = {
  title?: string
  difficulty?: Difficulty
  note?: string | null
  className?: string
}

export const ChristmasDoodleJump: React.FC<ChristmasDoodleJumpProps> = ({
  title = 'Polar Doodle Jump',
  difficulty = 'cozy',
  note,
  className,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const platformsRef = useRef<Platform[]>([])
  const snowRef = useRef<Snowflake[]>([])
  const playerRef = useRef({ x: GAME_WIDTH / 2 - PLAYER_WIDTH / 2, y: GAME_HEIGHT - 90, vy: 0 })
  const pressed = useRef({ left: false, right: false })
  const [gameState, setGameState] = useState<GameState>('ready')
  const [score, setScore] = useState(0)
  const [best, setBest] = useState(0)
  const [gifts, setGifts] = useState(0)
  const heightRef = useRef(0)
  const idRef = useRef(1)

  const settings = useMemo(() => SETTINGS[difficulty], [difficulty])

  const makeSnow = useCallback(() => {
    snowRef.current = Array.from({ length: 60 }, () => ({
      x: rand(0, GAME_WIDTH),
      y: rand(0, GAME_HEIGHT),
      size: rand(1, 2.6),
      speed: rand(0.35, 1.2),
      sway: rand(0.6, 1.6),
      offset: Math.random() * Math.PI * 2,
    }))
  }, [])

  const makePlatform = useCallback(
    (y: number, locked = false): Platform => {
      const width = clamp(rand(70, 110), 64, 124)
      const x = rand(12, GAME_WIDTH - width - 12)

      let type: PlatformType = 'static'
      if (!locked) {
        const roll = Math.random()
        if (roll < settings.gift) type = 'gift'
        else if (roll < settings.gift + settings.moving) type = 'moving'
        else if (roll < settings.gift + settings.moving + settings.crumble) type = 'crumbly'
      }

      const platform: Platform = {
        id: idRef.current++,
        x,
        y,
        width,
        height: 14,
        type,
      }

      if (type === 'moving') {
        platform.vx = Math.random() < 0.5 ? -1 : 1
      }

      return platform
    },
    [settings.crumble, settings.gift, settings.moving]
  )

  const buildInitial = useCallback(() => {
    const start: Platform[] = []
    let y = GAME_HEIGHT - 20
    while (y > -GAME_HEIGHT) {
      const anchor = y > GAME_HEIGHT - 80
      start.push(makePlatform(y, anchor))
      y -= rand(settings.gap - 14, settings.gap + 8)
    }
    platformsRef.current = start
  }, [makePlatform, settings.gap])

  const resetGame = useCallback(() => {
    idRef.current = 1
    heightRef.current = 0
    setScore(0)
    setGifts(0)
    playerRef.current = { x: GAME_WIDTH / 2 - PLAYER_WIDTH / 2, y: GAME_HEIGHT - 90, vy: settings.jump }
    buildInitial()
    makeSnow()
    setGameState('ready')
  }, [buildInitial, makeSnow, settings.jump])

  const startGame = useCallback(() => {
    if (gameState === 'playing') return
    if (gameState === 'lost') {
      resetGame()
    }
    setGameState('playing')
  }, [gameState, resetGame])

  const addPlatform = useCallback((y: number) => {
    platformsRef.current.push(makePlatform(y))
  }, [makePlatform])

  const handleInput = useCallback((e: KeyboardEvent, down: boolean) => {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') pressed.current.left = down
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') pressed.current.right = down
    if (e.key === ' ' && down && gameState !== 'playing') startGame()
  }, [gameState, startGame])

  useEffect(() => {
    resetGame()
  }, [resetGame])

  useEffect(() => {
    const keydown = (e: KeyboardEvent) => handleInput(e, true)
    const keyup = (e: KeyboardEvent) => handleInput(e, false)

    window.addEventListener('keydown', keydown)
    window.addEventListener('keyup', keyup)
    return () => {
      window.removeEventListener('keydown', keydown)
      window.removeEventListener('keyup', keyup)
    }
  }, [handleInput])

  const draw = useCallback(() => {
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT)

    const sky = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT)
    sky.addColorStop(0, '#112638')
    sky.addColorStop(1, '#1d3d4f')
    ctx.fillStyle = sky
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT)

    // Snow layer
    ctx.fillStyle = '#dce9f4'
    snowRef.current = snowRef.current.map((flake) => {
      const nx = flake.x + Math.sin(flake.offset + flake.y * 0.01) * flake.sway
      const ny = flake.y + flake.speed
      ctx.beginPath()
      ctx.arc(nx, ny, flake.size, 0, Math.PI * 2)
      ctx.fill()

      return {
        ...flake,
        x: nx,
        y: ny > GAME_HEIGHT ? -4 : ny,
        offset: flake.offset + 0.002,
      }
    })

    // Platforms
    platformsRef.current.forEach((p) => {
      const colors = platformColors[p.type]
      ctx.fillStyle = colors.base
      ctx.strokeStyle = colors.accent
      ctx.lineWidth = 2
      roundedRect(ctx, p.x, p.y, p.width, p.height, 6)
      ctx.fill()
      ctx.stroke()

      if (p.type === 'gift' && !p.giftCollected) {
        ctx.fillStyle = '#d1971b'
        ctx.fillRect(p.x + p.width / 2 - 6, p.y - 12, 12, 12)
        ctx.strokeStyle = '#fff'
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.moveTo(p.x + p.width / 2, p.y - 12)
        ctx.lineTo(p.x + p.width / 2, p.y)
        ctx.moveTo(p.x + p.width / 2 - 6, p.y - 6)
        ctx.lineTo(p.x + p.width / 2 + 6, p.y - 6)
        ctx.stroke()
      }
    })

    // Player
    const player = playerRef.current
    const px = player.x + PLAYER_WIDTH / 2
    const py = player.y + PLAYER_HEIGHT / 2

    ctx.save()
    ctx.translate(px, py)

    ctx.fillStyle = '#ff6b6b'
    roundedRect(ctx, -PLAYER_WIDTH / 2, -PLAYER_HEIGHT / 2 + 6, PLAYER_WIDTH, PLAYER_HEIGHT - 6, 10)
    ctx.fill()

    ctx.fillStyle = '#fde68a'
    roundedRect(ctx, -PLAYER_WIDTH / 2 + 4, -PLAYER_HEIGHT / 2 + 16, PLAYER_WIDTH - 8, 6, 3)
    ctx.fill()

    ctx.fillStyle = '#ffe0b2'
    ctx.beginPath()
    ctx.arc(0, -PLAYER_HEIGHT / 2 + 14, 11, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#c53030'
    ctx.beginPath()
    ctx.moveTo(-12, -PLAYER_HEIGHT / 2 + 8)
    ctx.lineTo(12, -PLAYER_HEIGHT / 2 + 8)
    ctx.lineTo(0, -PLAYER_HEIGHT / 2 - 8)
    ctx.closePath()
    ctx.fill()

    ctx.fillStyle = '#fff'
    ctx.beginPath()
    ctx.arc(0, -PLAYER_HEIGHT / 2 - 8, 4, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#0f172a'
    ctx.beginPath()
    ctx.arc(-5, -PLAYER_HEIGHT / 2 + 14, 1.8, 0, Math.PI * 2)
    ctx.arc(5, -PLAYER_HEIGHT / 2 + 14, 1.8, 0, Math.PI * 2)
    ctx.fill()

    ctx.restore()

    // Edge glow
    const vignette = ctx.createLinearGradient(0, 0, GAME_WIDTH, GAME_HEIGHT)
    vignette.addColorStop(0, 'rgba(0,0,0,0.12)')
    vignette.addColorStop(1, 'rgba(0,0,0,0.08)')
    ctx.fillStyle = vignette
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT)
  }, [])

  const step = useCallback(() => {
    if (gameState !== 'playing') return

    const player = playerRef.current
    const left = pressed.current.left ? -MOVE_SPEED : 0
    const right = pressed.current.right ? MOVE_SPEED : 0
    player.x += left + right

    if (player.x < -PLAYER_WIDTH) player.x = GAME_WIDTH
    if (player.x > GAME_WIDTH) player.x = -PLAYER_WIDTH

    player.vy += settings.gravity
    player.y += player.vy

    platformsRef.current = platformsRef.current.map((p) => {
      if (p.type === 'moving') {
        const nx = p.x + (p.vx || 0)
        const bounced = nx < 4 || nx + p.width > GAME_WIDTH - 4
        return { ...p, x: clamp(nx, 4, GAME_WIDTH - p.width - 4), vx: bounced ? -(p.vx || 1) : p.vx }
      }
      return p
    })

    if (player.vy > 0) {
      for (const platform of platformsRef.current) {
        const withinX = player.x + PLAYER_WIDTH > platform.x && player.x < platform.x + platform.width
        const withinY = player.y + PLAYER_HEIGHT >= platform.y && player.y + PLAYER_HEIGHT <= platform.y + platform.height + 6
        if (withinX && withinY) {
          const boost = platform.type === 'gift' ? 1.25 : 1
          player.vy = settings.jump * boost
          if (platform.type === 'gift' && !platform.giftCollected) {
            setGifts((g) => g + 1)
            platform.giftCollected = true
            platform.type = 'static'
          }
          if (platform.type === 'crumbly') platform.ttl = 0
          break
        }
      }
    }

    const ceiling = GAME_HEIGHT * 0.35
    if (player.y < ceiling) {
      const delta = ceiling - player.y
      player.y = ceiling
      heightRef.current += delta
      setScore(Math.floor(heightRef.current))
      platformsRef.current = platformsRef.current
        .map((p) => ({ ...p, y: p.y + delta }))
        .filter((p) => p.ttl !== 0)
    }

    platformsRef.current = platformsRef.current.filter((p) => p.y < GAME_HEIGHT + 30 && p.ttl !== 0)

    while (platformsRef.current.length < 24) {
      const topY = platformsRef.current.length
        ? Math.min(...platformsRef.current.map((p) => p.y))
        : GAME_HEIGHT
      addPlatform(topY - rand(settings.gap - 12, settings.gap + 14))
    }

    if (player.y > GAME_HEIGHT + 30) {
      setGameState('lost')
      setBest((b) => Math.max(b, Math.floor(heightRef.current)))
    }

    draw()
  }, [addPlatform, draw, gameState, settings.gap, settings.gravity, settings.jump])

  useEffect(() => {
    if (gameState !== 'playing') return
    let frameId = 0
    const loop = () => {
      step()
      frameId = requestAnimationFrame(loop)
    }
    frameId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frameId)
  }, [gameState, step])

  useEffect(() => {
    draw()
  }, [draw, gameState, score, gifts])

  return (
    <div className={cn('w-full', className)}>
      <div className="mx-auto flex max-w-5xl flex-col gap-5 rounded-2xl border border-border bg-card/70 p-6 shadow-lg backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🪜</span>
            <div>
              <h3 className="text-2xl font-bold tracking-tight text-primary">{title}</h3>
              <p className="text-sm text-muted-foreground">
                Steuere den kleinen Santa von Plattform zu Plattform und sammle Geschenke.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="rounded-full bg-amber-100/20 px-3 py-1 font-semibold text-amber-500">
              ⭐ {score}
            </div>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[auto,280px]">
          <div className="relative mx-auto w-fit rounded-2xl border border-border bg-gradient-to-b from-slate-900 to-slate-800 p-3 shadow-inner">
            <canvas
              ref={canvasRef}
              width={GAME_WIDTH}
              height={GAME_HEIGHT}
              className="rounded-xl border border-slate-500/30 bg-slate-900"
            />

            {gameState !== 'playing' && (
              <div className="absolute inset-3 flex items-center justify-center">
                <div className="rounded-xl border border-border bg-background/80 px-6 py-4 text-center shadow-xl backdrop-blur">
                  <div className="text-3xl">{gameState === 'lost' ? '💫' : '🎄'}</div>
                  <p className="mt-2 text-lg font-semibold text-foreground">
                    {gameState === 'lost' ? 'Autsch! Versuch es nochmal.' : 'Bereit zum Sprung?'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Pfeiltasten oder A/D zum Steuern.
                  </p>
                  <div className="mt-3 flex flex-wrap justify-center gap-2">
                    <Button size="sm" onClick={startGame}>Start</Button>
                    <Button size="sm" variant="outline" onClick={resetGame}>Neues Level</Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex flex-row w-full gap-2 rounded-xl border border-border bg-muted/40 p-3 min-w-64">
              <div className="rounded-lg bg-background/80 p-3 shadow-sm min-w-32 w-full">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Höhe</p>
                <p className="text-2xl font-bold text-primary">{score} m</p>
              </div>
              <div className="rounded-lg bg-background/80 p-3 shadow-sm w-full">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Geschenke</p>
                <p className="text-2xl font-bold text-amber-600">{gifts}</p>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-background/80 p-4 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Steuerung</p>
              <ul className="mt-2 space-y-1 text-sm text-foreground/90">
                <li className="flex items-center justify-between"><span>Links / Rechts</span><span className="font-mono text-muted-foreground">← → oder A/D</span></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChristmasDoodleJump
