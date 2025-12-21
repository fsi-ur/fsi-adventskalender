'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { cn } from '@/utilities/ui'

type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades'
type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A'

interface Card {
  suit: Suit
  rank: Rank
  value: number
}

const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades']
const RANKS: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']

const getCardValue = (rank: Rank): number => {
  if (['J', 'Q', 'K'].includes(rank)) return 10
  if (rank === 'A') return 11
  return parseInt(rank)
}

const createDeck = (): Card[] => {
  const deck: Card[] = []
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ suit, rank, value: getCardValue(rank) })
    }
  }
  return deck
}

const shuffleDeck = (deck: Card[]): Card[] => {
  const newDeck = [...deck]
  for (let i = newDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]]
  }
  return newDeck
}

const calculateHandValue = (hand: Card[]): number => {
  let value = 0
  let aces = 0
  for (const card of hand) {
    value += card.value
    if (card.rank === 'A') aces += 1
  }
  while (value > 21 && aces > 0) {
    value -= 10
    aces -= 1
  }
  return value
}

const CardComponent: React.FC<{ card: Card; hidden?: boolean }> = ({ card, hidden }) => {
  if (hidden) {
    return (
      <div className="w-24 h-36 bg-red-700 rounded-lg border-2 border-white shadow-md flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgdmlld0JveD0iMCAwIDIwIDIwIiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iMiI+PHBhdGggZD0iTTAgMjBMMjAgME0wIDBMMjAgMjAiLz48L3N2Zz4=')]"></div>
        <span className="text-4xl">🎄</span>
      </div>
    )
  }

  const isRed = card.suit === 'hearts' || card.suit === 'diamonds'
  
  let suitIcon = ''
  switch (card.suit) {
    case 'hearts': suitIcon = '♥'; break
    case 'diamonds': suitIcon = '♦'; break
    case 'clubs': suitIcon = '♣'; break
    case 'spades': suitIcon = '♠'; break
  }

  let faceIcon = ''
  if (['J', 'Q', 'K'].includes(card.rank)) {
     // Christmas heads on figures
     if (card.rank === 'K') faceIcon = '🎅' // Santa
     else if (card.rank === 'Q') faceIcon = '🤶' // Mrs Claus
     else if (card.rank === 'J') faceIcon = '🧝' // Elf
  }

  return (
    <div className={cn(
      "w-24 h-36 bg-white rounded-lg border border-gray-300 shadow-md flex flex-col justify-between p-2 relative select-none",
      isRed ? "text-red-600" : "text-black"
    )}>
      <div className="text-left leading-none">
        <div className="font-bold text-lg">{card.rank}</div>
        <div className="text-xl">{suitIcon}</div>
      </div>
      
      <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
         {/* Background decoration */}
         <span className="text-6xl">{suitIcon}</span>
      </div>

      {faceIcon && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-4xl drop-shadow-md">{faceIcon}</span>
        </div>
      )}

      <div className="text-right leading-none rotate-180">
        <div className="font-bold text-lg">{card.rank}</div>
        <div className="text-xl">{suitIcon}</div>
      </div>
      
      {/* Small christmas decoration */}
      <div className="absolute top-1 right-1 text-xs opacity-50">🎄</div>
      <div className="absolute bottom-1 left-1 text-xs opacity-50 rotate-180">🎄</div>
    </div>
  )
}

export const BlackJack: React.FC = () => {
  const [credits, setCredits] = useState(50)
  const [bet, setBet] = useState(10)
  const [deck, setDeck] = useState<Card[]>([])
  const [playerHand, setPlayerHand] = useState<Card[]>([])
  const [dealerHand, setDealerHand] = useState<Card[]>([])
  const [gameState, setGameState] = useState<'betting' | 'playing' | 'dealerTurn' | 'gameOver'>('betting')
  const [message, setMessage] = useState('')

  // Initialize deck
  useEffect(() => {
    setDeck(shuffleDeck(createDeck()))
  }, [])

  const startRound = () => {
    if (credits < bet) {
      setMessage("Not enough Christmas Dollars!")
      return
    }
    
    let currentDeck = [...deck]
    if (currentDeck.length < 10) {
      currentDeck = shuffleDeck(createDeck())
    }

    const pHand = [currentDeck.pop()!, currentDeck.pop()!]
    const dHand = [currentDeck.pop()!, currentDeck.pop()!]

    setDeck(currentDeck)
    setPlayerHand(pHand)
    setDealerHand(dHand)
    setCredits(prev => prev - bet)
    setGameState('playing')
    setMessage('')

    // Check for instant Blackjack
    const pValue = calculateHandValue(pHand)
    if (pValue === 21) {
        // Dealer turn to check for tie
        handleDealerTurn(dHand, currentDeck, pHand, true)
    }
  }

  const hit = () => {
    const newDeck = [...deck]
    const card = newDeck.pop()!
    const newHand = [...playerHand, card]
    setPlayerHand(newHand)
    setDeck(newDeck)

    if (calculateHandValue(newHand) > 21) {
      setGameState('gameOver')
      setMessage('Bust! You lost.')
    }
  }

  const stand = () => {
    handleDealerTurn(dealerHand, deck, playerHand)
  }

  const handleDealerTurn = (dHand: Card[], currentDeck: Card[], pHand: Card[], playerHasBlackjack = false) => {
    setGameState('dealerTurn')
    let newDHand = [...dHand]
    let newDeck = [...currentDeck]

    // Dealer hits on soft 17 or less than 17? Standard is hit until >= 17.
    while (calculateHandValue(newDHand) < 17) {
      newDHand.push(newDeck.pop()!)
    }

    setDealerHand(newDHand)
    setDeck(newDeck)
    
    const dValue = calculateHandValue(newDHand)
    const pValue = calculateHandValue(pHand)

    setGameState('gameOver')

    if (playerHasBlackjack) {
        if (dValue === 21 && newDHand.length === 2) {
             setCredits(prev => prev + bet) // Push
             setMessage("Push! Both have Blackjack.")
        } else {
             setCredits(prev => prev + bet * 2.5) // Blackjack pays 3:2 usually, but let's do 2.5x total return (1.5x win)
             setMessage("Blackjack! You win!")
        }
        return
    }

    if (dValue > 21) {
      setCredits(prev => prev + bet * 2)
      setMessage('Dealer Busts! You win!')
    } else if (dValue > pValue) {
      setMessage('Dealer wins.')
    } else if (dValue < pValue) {
      setCredits(prev => prev + bet * 2)
      setMessage('You win!')
    } else {
      setCredits(prev => prev + bet)
      setMessage('Push!')
    }
  }

  const resetGame = () => {
      setCredits(50)
      setBet(10)
      setGameState('betting')
      setMessage('')
      setPlayerHand([])
      setDealerHand([])
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[600px] bg-green-900 p-4 rounded-xl text-white font-sans relative overflow-hidden border-4 border-red-700 shadow-2xl">
      {/* Christmas Decorations */}
      <div className="absolute top-0 left-0 w-full h-8 bg-repeat-x" style={{backgroundImage: 'radial-gradient(circle, white 2px, transparent 2.5px)', backgroundSize: '20px 20px', opacity: 0.3}}></div>
      
      <h2 className="text-3xl font-bold mb-4 text-red-100 drop-shadow-lg font-serif">Blackjack - the christmas edition</h2>
      
      <div className="mb-6 text-xl bg-red-800 px-6 py-2 rounded-full border-2 border-yellow-400 shadow-lg">
        Credits: <span className="font-bold text-yellow-300">{credits}</span> 🎄$
      </div>

      {gameState === 'betting' && (
        <div className="flex flex-col items-center gap-4 z-10">
          <p className="text-lg">Place your bet to start!</p>
          <div className="flex items-center gap-4">
            <button 
                onClick={() => setBet(Math.max(5, bet - 5))}
                className="w-10 h-10 rounded-full bg-red-600 hover:bg-red-500 font-bold border-2 border-white"
            >-</button>
            <span className="text-2xl font-bold w-16 text-center">{bet}</span>
            <button 
                onClick={() => setBet(Math.min(credits, bet + 5))}
                className="w-10 h-10 rounded-full bg-green-600 hover:bg-green-500 font-bold border-2 border-white"
            >+</button>
          </div>
          <button 
            onClick={startRound}
            disabled={credits < bet}
            className="mt-4 px-8 py-3 bg-yellow-500 hover:bg-yellow-400 text-red-900 font-bold rounded-lg shadow-lg transform transition hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Deal Cards 🎅
          </button>
          {credits === 0 && (
              <button onClick={resetGame} className="mt-2 text-sm underline text-gray-300 hover:text-white">
                  Reset Game (Bankrupt)
              </button>
          )}
        </div>
      )}

      {(gameState === 'playing' || gameState === 'dealerTurn' || gameState === 'gameOver') && (
        <div className="w-full max-w-4xl flex flex-col gap-8 z-10">
          
          {/* Dealer Area */}
          <div className="flex flex-col items-center">
            <h3 className="text-lg font-semibold mb-2 text-gray-300">Dealer's Hand {gameState === 'gameOver' && `(${calculateHandValue(dealerHand)})`}</h3>
            <div className="flex gap-[-4rem] justify-center">
              {dealerHand.map((card, i) => (
                <div key={i} className={cn("transform transition-all duration-500", i > 0 && "-ml-12")}>
                  <CardComponent 
                    card={card} 
                    hidden={gameState === 'playing' && i === 0} 
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Message Area */}
          <div className="h-16 flex items-center justify-center">
            {message && (
                <div className="bg-white/90 text-red-800 px-6 py-2 rounded-lg font-bold text-xl shadow-xl animate-bounce">
                    {message}
                </div>
            )}
          </div>

          {/* Player Area */}
          <div className="flex flex-col items-center">
            <h3 className="text-lg font-semibold mb-2 text-gray-300">Your Hand ({calculateHandValue(playerHand)})</h3>
            <div className="flex gap-[-4rem] justify-center mb-6">
              {playerHand.map((card, i) => (
                <div key={i} className={cn("transform transition-all duration-500", i > 0 && "-ml-12")}>
                  <CardComponent card={card} />
                </div>
              ))}
            </div>

            {gameState === 'playing' && (
                <div className="flex gap-4">
                    <button 
                        onClick={hit}
                        className="px-8 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg shadow-lg border-2 border-green-400"
                    >
                        HIT
                    </button>
                    <button 
                        onClick={stand}
                        className="px-8 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg shadow-lg border-2 border-red-400"
                    >
                        STAND
                    </button>
                </div>
            )}

            {gameState === 'gameOver' && (
                <button 
                    onClick={() => setGameState('betting')}
                    className="px-8 py-3 bg-yellow-500 hover:bg-yellow-400 text-red-900 font-bold rounded-lg shadow-lg animate-pulse"
                >
                    Play Again ↻
                </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
